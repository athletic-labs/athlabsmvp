import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export type UserRole = 'team_staff' | 'team_admin' | 'athletic_labs_admin' | 'athletic_labs_staff';

export interface TeamPermissions {
  can_create_orders: boolean;
  can_view_all_orders: boolean;
  can_edit_orders: boolean;
  can_delete_orders: boolean;
  can_manage_team: boolean;
  can_view_analytics: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  team_id: string | null;
  team_name?: string;
  permissions?: TeamPermissions;
  is_active: boolean;
  last_login_at?: string;
  onboarding_completed?: boolean;
}

export class RBACService {
  private static supabase = createClientComponentClient();

  static async getUserPermissions(userId: string, teamId: string): Promise<TeamPermissions | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_permissions_view')
        .select('*')
        .eq('user_id', userId)
        .eq('team_id', teamId)
        .single();

      if (error) throw error;

      return {
        can_create_orders: data.can_create_orders,
        can_view_all_orders: data.can_view_all_orders,
        can_edit_orders: data.can_edit_orders,
        can_delete_orders: data.can_delete_orders,
        can_manage_team: data.can_manage_team,
        can_view_analytics: data.can_view_analytics,
      };
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return null;
    }
  }

  static async hasPermission(
    userId: string, 
    teamId: string, 
    permission: keyof TeamPermissions
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('has_team_permission', {
          user_uuid: userId,
          team_uuid: teamId,
          permission_name: permission
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  static async updateUserPermissions(
    userId: string,
    teamId: string,
    permissions: Partial<TeamPermissions>,
    grantedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('team_permissions')
        .upsert({
          user_id: userId,
          team_id: teamId,
          ...permissions,
          granted_by: grantedBy,
          granted_at: new Date().toISOString(),
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating permissions:', error);
      return false;
    }
  }

  static async revokeUserAccess(userId: string, teamId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('team_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('team_id', teamId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error revoking access:', error);
      return false;
    }
  }

  static canPerformAction(userRole: UserRole, action: string): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      'team_staff': 1,
      'team_admin': 2,
      'athletic_labs_staff': 3,
      'athletic_labs_admin': 4,
    };

    const actionRequirements: Record<string, number> = {
      'view_own_orders': 1,
      'create_orders': 1,
      'view_team_orders': 2,
      'manage_team': 2,
      'view_analytics': 2,
      'system_admin': 4,
    };

    const requiredLevel = actionRequirements[action];
    const userLevel = roleHierarchy[userRole];

    return userLevel >= requiredLevel;
  }

  static async logAuditEvent(
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (user) {
        await this.supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            metadata,
            ip_address: await this.getClientIP(),
            user_agent: navigator.userAgent,
          });
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  private static async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }
}