import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createTemplateSchema, getTemplatesQuerySchema } from '@/lib/validation/api-schemas';
import { z } from 'zod';
import { 
  withBodyValidation, 
  withQueryValidation,
  createSuccessResponse,
  AuthenticationError,
  ValidationError,
  NotFoundError,
  generateRequestId
} from '@/lib/validation/api-middleware';
import { withGlobalErrorHandler, DatabaseError } from '@/lib/middleware/global-error-handler';
import { generalApiRateLimit, withRateLimit } from '@/lib/middleware/rate-limit';

// DELETE template validation schema
const deleteTemplateSchema = z.object({
  templateId: z.string().uuid('Invalid template ID format'),
});

/**
 * @swagger
 * /api/templates:
 *   post:
 *     summary: Create a saved template
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTemplate'
 *     responses:
 *       201:
 *         description: Template created successfully
 */
export const POST = withRateLimit(generalApiRateLimit)(
  withGlobalErrorHandler(
    withBodyValidation(
      createTemplateSchema,
      async (request: NextRequest, templateData) => {
        const requestId = generateRequestId();
        
        try {
          const supabase = createRouteHandlerClient({ cookies });
          
          // Check authentication
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new AuthenticationError('Authentication required');
          }
          
          // Get user's team with role check
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('team_id, role')
            .eq('id', session.user.id)
            .single();
          
          if (profileError || !profile?.team_id) {
            throw new ValidationError('User must be associated with a team', profileError || { reason: 'missing_team_id' });
          }

          // Check if template name already exists for this team
          const { data: existingTemplate } = await supabase
            .from('saved_templates')
            .select('id')
            .eq('team_id', profile.team_id)
            .eq('name', templateData.name)
            .single();

          if (existingTemplate) {
            throw new ValidationError('A template with this name already exists', { name: templateData.name, team_id: profile.team_id });
          }
          
          // Create template
          const { data: template, error: createError } = await supabase
            .from('saved_templates')
            .insert({
              team_id: profile.team_id,
              created_by: session.user.id,
              name: templateData.name,
              description: templateData.description,
              items: templateData.items,
              times_used: 0,
              is_favorite: false,
            })
            .select()
            .single();
          
          if (createError) {
            throw new DatabaseError('Failed to create template', createError);
          }
          
          return createSuccessResponse(
            { template },
            201,
            { requestId }
          );

        } catch (error) {
          console.error(`Template creation failed [${requestId}]:`, error);
          throw error;
        }
      }
    )
  )
);

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Get saved templates for team
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
export const GET = withRateLimit(generalApiRateLimit)(
  withGlobalErrorHandler(
    withQueryValidation(
      getTemplatesQuerySchema,
      async (request: NextRequest, query) => {
        const requestId = generateRequestId();
        
        try {
          const supabase = createRouteHandlerClient({ cookies });
          
          // Check authentication
          const { data: { session } } = await supabase.auth.getSession();
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
            throw new ValidationError('User must be associated with a team', { reason: 'missing_team_id' });
          }
          
          // Build query with pagination
          let templatesQuery = supabase
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
            `, { count: 'exact' })
            .eq('team_id', profile.team_id)
            .order('created_at', { ascending: false });

          // Apply pagination
          const page = query.page || 1;
          const limit = query.limit || 50;
          const offset = (page - 1) * limit;
          templatesQuery = templatesQuery.range(offset, offset + limit - 1);

          const { data: templates, error, count } = await templatesQuery;
          
          if (error) {
            throw new DatabaseError('Failed to fetch templates', error);
          }
          
          // Calculate pagination metadata
          const totalPages = Math.ceil((count || 0) / limit);
          const hasNextPage = page < totalPages;
          const hasPreviousPage = page > 1;

          const response = createSuccessResponse(
            {
              templates: templates || [],
              pagination: {
                page: query.page,
                limit: query.limit,
                total: count || 0,
                totalPages,
                hasNextPage,
                hasPreviousPage,
              },
            },
            200,
            { requestId }
          );

          // Add cache control headers
          response.headers.set('Cache-Control', 'private, max-age=300'); // 5 minutes cache
          return response;

        } catch (error) {
          console.error(`Templates fetch failed [${requestId}]:`, error);
          throw error;
        }
      }
    )
  )
);

/**
 * @swagger
 * /api/templates:
 *   delete:
 *     summary: Delete a saved template
 *     tags: [Templates]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *                 format: uuid
 *             required:
 *               - templateId
 *     responses:
 *       200:
 *         description: Template deleted successfully
 */
export const DELETE = withRateLimit(generalApiRateLimit)(
  withGlobalErrorHandler(
    withBodyValidation(
      deleteTemplateSchema,
      async (request: NextRequest, { templateId }) => {
        const requestId = generateRequestId();
        
        try {
          const supabase = createRouteHandlerClient({ cookies });
          
          // Check authentication
          const { data: { session } } = await supabase.auth.getSession();
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
            throw new ValidationError('User must be associated with a team', { reason: 'missing_team_id' });
          }
          
          // Check if template exists and belongs to team
          const { data: existingTemplate } = await supabase
            .from('saved_templates')
            .select('id, team_id, created_by, name')
            .eq('id', templateId)
            .single();
          
          if (!existingTemplate) {
            throw new NotFoundError('Template not found');
          }
          
          if (existingTemplate.team_id !== profile.team_id) {
            throw new ValidationError('Template does not belong to your team', { template_team_id: existingTemplate.team_id, user_team_id: profile.team_id });
          }

          // Only allow deletion by template creator or team admin
          if (existingTemplate.created_by !== session.user.id && 
              !['team_admin', 'athletic_labs_admin'].includes(profile.role)) {
            throw new ValidationError('Only template creator or team admin can delete templates', { user_id: session.user.id, creator_id: existingTemplate.created_by, user_role: profile.role });
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
  )
);