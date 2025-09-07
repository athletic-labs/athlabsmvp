import { createSupabaseServerClientOptimized } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createSuccessResponse,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  generateRequestId
} from '@/lib/validation/api-middleware';
import { withGlobalErrorHandler, DatabaseError } from '@/lib/middleware/global-error-handler';
import { withAdaptiveRateLimit, adaptivePresets } from '@/lib/middleware/adaptive-rate-limit';

// Validation schema
const templateIdSchema = z.object({
  id: z.string().uuid('Invalid template ID format'),
});

/**
 * @swagger
 * /api/templates/{id}/favorite:
 *   post:
 *     summary: Toggle template favorite status
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Template favorite status toggled successfully
 *       404:
 *         description: Template not found
 */
export const POST = withAdaptiveRateLimit(adaptivePresets.api)(
  withGlobalErrorHandler(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const requestId = generateRequestId();
      
      try {
        // Validate template ID
        const { id: templateId } = templateIdSchema.parse({ id: params.id });
        
        // Create optimized Supabase client
        const initialSupabase = createSupabaseServerClientOptimized();
        const { data: { session } } = await initialSupabase.auth.getSession();
        const supabase = createSupabaseServerClientOptimized(session?.user?.id);
        
        if (!session) {
          throw new AuthenticationError('Authentication required');
        }
        
        // Get user's team
        const { data: profile } = await supabase
          .from('profiles')
          .select('team_id, role')
          .eq('id', session.user.id)
          .single();
        
        if (!profile?.team_id) {
          throw new ValidationError('User must be associated with a team', null);
        }
        
        // Get current template state and verify access
        const { data: currentTemplate } = await supabase
          .from('saved_templates')
          .select('id, team_id, is_favorite, name')
          .eq('id', templateId)
          .single();
        
        if (!currentTemplate) {
          throw new NotFoundError('Template not found');
        }
        
        if (currentTemplate.team_id !== profile.team_id) {
          throw new ValidationError('Template does not belong to your team', null);
        }
        
        // Toggle favorite status with atomic update and return full template data
        const newFavoriteStatus = !currentTemplate.is_favorite;
        
        const { data: updatedTemplate, error: updateError } = await supabase
          .from('saved_templates')
          .update({
            is_favorite: newFavoriteStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .eq('team_id', profile.team_id)
          .select(`
            id,
            name,
            description,
            items,
            times_used,
            last_used_at,
            is_favorite,
            created_at,
            updated_at,
            profiles:created_by (
              first_name,
              last_name
            )
          `)
          .single();
        
        if (updateError) {
          throw new DatabaseError('Failed to update template favorite status', updateError);
        }
        
        return createSuccessResponse(
          { 
            template: updatedTemplate,
            message: `Template ${newFavoriteStatus ? 'added to' : 'removed from'} favorites`
          },
          200,
          { requestId }
        );
        
      } catch (error) {
        console.error(`Template favorite toggle failed [${requestId}]:`, error);
        throw error;
      }
    }
  )
);

/**
 * @swagger
 * /api/templates/{id}/favorite:
 *   delete:
 *     summary: Remove template from favorites
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Template removed from favorites successfully
 */
export const DELETE = withAdaptiveRateLimit(adaptivePresets.api)(
  withGlobalErrorHandler(
    async (request: NextRequest, { params }: { params: { id: string } }) => {
      const requestId = generateRequestId();
      
      try {
        // Validate template ID
        const { id: templateId } = templateIdSchema.parse({ id: params.id });
        
        // Create optimized Supabase client
        const initialSupabase = createSupabaseServerClientOptimized();
        const { data: { session } } = await initialSupabase.auth.getSession();
        const supabase = createSupabaseServerClientOptimized(session?.user?.id);
        
        if (!session) {
          throw new AuthenticationError('Authentication required');
        }
        
        // Get user's team
        const { data: profile } = await supabase
          .from('profiles')
          .select('team_id, role')
          .eq('id', session.user.id)
          .single();
        
        if (!profile?.team_id) {
          throw new ValidationError('User must be associated with a team', null);
        }
        
        // Update template to remove from favorites
        const { data: updatedTemplate, error: updateError } = await supabase
          .from('saved_templates')
          .update({
            is_favorite: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .eq('team_id', profile.team_id)
          .select(`
            id,
            name,
            description,
            items,
            times_used,
            last_used_at,
            is_favorite,
            created_at,
            updated_at,
            profiles:created_by (
              first_name,
              last_name
            )
          `)
          .single();
        
        if (updateError) {
          throw new DatabaseError('Failed to remove template from favorites', updateError);
        }
        
        if (!updatedTemplate) {
          throw new NotFoundError('Template not found');
        }
        
        return createSuccessResponse(
          { 
            template: updatedTemplate,
            message: 'Template removed from favorites'
          },
          200,
          { requestId }
        );
        
      } catch (error) {
        console.error(`Template favorite removal failed [${requestId}]:`, error);
        throw error;
      }
    }
  )
);