output "production_url" {
  description = "Production deployment URL"
  value       = vercel_deployment.production.url
}

output "staging_url" {
  description = "Staging deployment URL"
  value       = vercel_deployment.staging.url
}

output "project_id" {
  description = "Vercel project ID"
  value       = vercel_project.athletic_labs.id
}