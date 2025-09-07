import { createSupabaseServerClientOptimized } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  withQueryValidation,
  createSuccessResponse,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  generateRequestId
} from '@/lib/validation/api-middleware';
import { withGlobalErrorHandler, DatabaseError } from '@/lib/middleware/global-error-handler';
import { withAdaptiveRateLimit, adaptivePresets } from '@/lib/middleware/adaptive-rate-limit';
import { withTemplateSanitization } from '@/lib/middleware/sanitization-middleware';

// Validation schemas
const templateIdSchema = z.object({
  id: z.string().uuid('Invalid template ID format'),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(100, 'Template name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  items: z.array(z.any()).optional(), // Template items can be any structure
  is_favorite: z.boolean().optional(),
});

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Get a single template by ID
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
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
export const GET = withAdaptiveRateLimit(adaptivePresets.api)(
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
        
        // Get user's team for authorization
        const { data: profile } = await supabase
          .from('profiles')
          .select('team_id, role')
          .eq('id', session.user.id)
          .single();
        
        if (!profile?.team_id) {
          throw new ValidationError('User must be associated with a team', null);
        }
        
        // Fetch template with creator info in single query
        const { data: template, error } = await supabase
          .from('saved_templates')
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
          .eq('id', templateId)
          .eq('team_id', profile.team_id) // Ensure user can only access their team's templates
          .single();
        
        if (error || !template) {
          throw new NotFoundError('Template not found');
        }
        
        return createSuccessResponse(
          { template },
          200,
          { requestId }
        );
        
      } catch (error) {
        console.error(`Template fetch failed [${requestId}]:`, error);
        throw error;
      }
    }
  )
);

/**
 * @swagger
 * /api/templates/{id}:
 *   put:
 *     summary: Update a template
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               items:
 *                 type: array
 *               is_favorite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Template updated successfully
 */
export const PUT = withTemplateSanitization(
  withAdaptiveRateLimit(adaptivePresets.api)(
    withGlobalErrorHandler(
      async (request: NextRequest, { params }: { params: { id: string } }) => {
        const requestId = generateRequestId();
        
        try {
          // Validate template ID
          const { id: templateId } = templateIdSchema.parse({ id: params.id });
          
          // Parse and validate request body
          let updateData;
          try {
            const body = await request.json();
            updateData = updateTemplateSchema.parse(body);
          } catch (error) {
            throw new ValidationError('Invalid request body', error);
          }
            
            // Create optimized Supabase client
            const initialSupabase = createSupabaseServerClientOptimized();
            const { data: { session } } = await initialSupabase.auth.getSession();
            const supabase = createSupabaseServerClientOptimized(session?.user?.id);
            
            if (!session) {
              throw new AuthenticationError('Authentication required');
            }
            
            // Get user's team and role
            const { data: profile } = await supabase
              .from('profiles')
              .select('team_id, role')
              .eq('id', session.user.id)
              .single();
            
            if (!profile?.team_id) {
              throw new ValidationError('User must be associated with a team', null);
            }
            
            // Check if template exists and user has permission to update
            const { data: existingTemplate } = await supabase
              .from('saved_templates')
              .select('id, team_id, created_by, name')
              .eq('id', templateId)
              .single();
            
            if (!existingTemplate) {
              throw new NotFoundError('Template not found');
            }
            
            if (existingTemplate.team_id !== profile.team_id) {
              throw new ValidationError('Template does not belong to your team', null);
            }
            
            // Only allow updates by creator or team admin
            if (existingTemplate.created_by !== session.user.id && 
                !['team_admin', 'athletic_labs_admin'].includes(profile.role)) {
              throw new ValidationError('Only template creator or team admin can update templates', null);
            }
            
            // Check for name conflicts if name is being updated
            if (updateData.name && updateData.name !== existingTemplate.name) {
              const { data: conflictingTemplate } = await supabase
                .from('saved_templates')
                .select('id')
                .eq('team_id', profile.team_id)
                .eq('name', updateData.name)
                .neq('id', templateId)
                .single();
              
              if (conflictingTemplate) {
                throw new ValidationError('A template with this name already exists', null);
              }
            }
            
            // Update template with optimized query
            const { data: updatedTemplate, error: updateError } = await supabase
              .from('saved_templates')
              .update({
                ...updateData,
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
              throw new DatabaseError('Failed to update template', updateError);
            }
            
            return createSuccessResponse(
              { template: updatedTemplate },
              200,
              { requestId }
            );
            
        } catch (error) {
          console.error(`Template update failed [${requestId}]:`, error);
          throw error;
        }
      }
    )
  )
);

/**
 * @swagger
 * /api/templates/{id}:
 *   delete:
 *     summary: Delete a template by ID
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
 *         description: Template deleted successfully
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
        
        // Check template exists and get info for permission check
        const { data: existingTemplate } = await supabase
          .from('saved_templates')
          .select('id, team_id, created_by, name')
          .eq('id', templateId)
          .single();
        
        if (!existingTemplate) {
          throw new NotFoundError('Template not found');
        }
        
        if (existingTemplate.team_id !== profile.team_id) {
          throw new ValidationError('Template does not belong to your team', null);
        }
        
        // Only allow deletion by creator or team admin
        if (existingTemplate.created_by !== session.user.id && 
            !['team_admin', 'athletic_labs_admin'].includes(profile.role)) {
          throw new ValidationError('Only template creator or team admin can delete templates', null);
        }
        
        // Delete template
        const { error: deleteError } = await supabase
          .from('saved_templates')
          .delete()
          .eq('id', templateId)
          .eq('team_id', profile.team_id);
        
        if (deleteError) {
          throw new DatabaseError('Failed to delete template', deleteError);
        }
        
        return createSuccessResponse(
          { 
            message: 'Template deleted successfully',
            templateId,
            templateName: existingTemplate.name,
          },
          200,
          { requestId }
        );
        
      } catch (error) {
        console.error(`Template deletion failed [${requestId}]:`, error);
        throw error;
      }
    }
  )
);