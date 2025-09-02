terraform {
  required_version = ">= 1.0"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
  }
  
  backend "s3" {
    # Configure with your S3 bucket for state storage
    # bucket = "athletic-labs-terraform-state"
    # key    = "terraform.tfstate"
    # region = "us-east-1"
  }
}

provider "vercel" {
  # Configure with VERCEL_API_TOKEN environment variable
}

# Vercel Project Configuration
resource "vercel_project" "athletic_labs" {
  name      = "athletic-labs"
  framework = "nextjs"
  
  environment = [
    {
      key    = "NEXT_PUBLIC_SUPABASE_URL"
      value  = var.supabase_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      value  = var.supabase_anon_key
      target = ["production", "preview"]
    },
    {
      key    = "SUPABASE_SERVICE_ROLE_KEY"
      value  = var.supabase_service_role_key
      target = ["production"]
    },
    {
      key    = "STRIPE_PUBLISHABLE_KEY"
      value  = var.stripe_publishable_key
      target = ["production", "preview"]
    },
    {
      key    = "STRIPE_SECRET_KEY"
      value  = var.stripe_secret_key
      target = ["production"]
    },
    {
      key    = "NEXTAUTH_SECRET"
      value  = var.nextauth_secret
      target = ["production", "preview"]
    },
    {
      key    = "SENTRY_DSN"
      value  = var.sentry_dsn
      target = ["production", "preview"]
    }
  ]
  
  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}

# Production Deployment
resource "vercel_deployment" "production" {
  project_id = vercel_project.athletic_labs.id
  production = true
  
  environment = {
    NODE_ENV = "production"
  }
}

# Staging Deployment
resource "vercel_deployment" "staging" {
  project_id = vercel_project.athletic_labs.id
  production = false
  
  environment = {
    NODE_ENV = "staging"
  }
}