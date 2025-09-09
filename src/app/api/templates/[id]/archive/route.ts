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

// Validation schemas
const templateIdSchema = z.object({
  id: z.string().uuid('Invalid template ID format'),
});

/**
 * @swagger
 * /api/templates/{id}/archive:
 *   post:
 *     summary: Archive a template (soft delete)
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
 *         description: Template archived successfully
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
        
        // Check template exists and get info for permission check
        const { data: existingTemplate } = await supabase
          .from('saved_templates')
          .select('id, team_id, created_by, name, archived_at')
          .eq('id', templateId)
          .single();
        
        if (!existingTemplate) {
          throw new NotFoundError('Template not found');
        }
        
        if (existingTemplate.team_id !== profile.team_id) {
          throw new ValidationError('Template does not belong to your team', null);
        }

        if (existingTemplate.archived_at) {
          throw new ValidationError('Template is already archived', null);
        }
        
        // Only allow archiving by creator or team admin
        if (existingTemplate.created_by !== session.user.id && 
            !['team_admin', 'athletic_labs_admin'].includes(profile.role)) {
          throw new ValidationError('Only template creator or team admin can archive templates', null);
        }
        
        // Archive template (soft delete)
        const { error: archiveError } = await supabase
          .from('saved_templates')
          .update({
            archived_at: new Date().toISOString(),
            archived_by: session.user.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', templateId)
          .eq('team_id', profile.team_id);
        
        if (archiveError) {
          throw new DatabaseError('Failed to archive template', archiveError);
        }
        
        return createSuccessResponse(
          { 
            message: 'Template archived successfully',
            templateId,
            templateName: existingTemplate.name,
          },
          200,
          { requestId }
        );
        
      } catch (error) {
        console.error(`Template archive failed [${requestId}]:`, error);
        throw error;
      }
    }
  )
);