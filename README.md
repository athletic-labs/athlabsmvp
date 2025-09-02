# Athletic Labs - Enterprise SaaS Platform

Athletic Labs is a comprehensive catering management platform designed for athletic teams and organizations. Built with Next.js 14, TypeScript, Supabase, and Material Design 3.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Stripe account for payments

### Environment Setup
```bash
# Clone the repository
git clone <repository-url>
cd athletic-labs

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your environment variables (see Environment Variables section)
# Start development server
npm run dev
```

### Environment Variables
Create `.env.local` with the following variables:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Framework**: Material Design 3, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RBAC
- **Payments**: Stripe
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation

### Key Features
- **Multi-tenant RBAC**: Role-based access control with team-level permissions
- **Order Management**: Complete catering order lifecycle
- **Template System**: Reusable meal templates and customization
- **Calendar Integration**: Team schedule and delivery coordination
- **Analytics Dashboard**: Business intelligence and reporting
- **Material Design 3**: Modern, accessible component library

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API endpoints
├── components/            # Reusable React components
├── lib/
│   ├── auth/             # Authentication and RBAC
│   ├── design-system/    # Material 3 components
│   ├── services/         # Business logic services
│   ├── store/            # Zustand state management
│   └── validation/       # Zod schemas and validation
└── styles/               # Global styles and themes
```

## 🔐 Security

### Authentication Flow
1. Supabase Auth handles user authentication
2. Middleware enforces RBAC on all protected routes
3. Row Level Security (RLS) in database
4. Comprehensive audit logging

### Role-Based Access Control
- **athletic_labs_admin**: Full platform access
- **athletic_labs_staff**: Platform management access
- **team_admin**: Team management and analytics
- **team_staff**: Order creation and basic access

## 📊 Database Schema

### Core Tables
- `profiles`: User profiles with role and team associations
- `teams`: Team entities with configuration and billing
- `orders`: Order management with status tracking
- `menu_templates`: Reusable meal templates
- `menu_items`: Individual menu items and pricing
- `audit_logs`: Comprehensive activity logging

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Quality
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Prettier for code formatting
- Husky pre-commit hooks

## 🚢 Deployment

### Production Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### Environment Configuration
- **Development**: `.env.local`
- **Production**: Vercel environment variables

## 📈 Monitoring

### Performance Monitoring
- Client-side Web Vitals tracking
- Custom performance metrics
- Error boundary implementation

### Analytics
- Business event tracking
- User behavior analytics
- Conversion funnel analysis

## 🔧 API Documentation

### Authentication API
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Orders API
- `GET /api/v1/orders` - List orders with pagination
- `POST /api/v1/orders` - Create new order
- `PUT /api/v1/orders/:id` - Update order
- `DELETE /api/v1/orders/:id` - Cancel order

### Teams API
- `GET /api/v1/teams` - List teams (admin only)
- `POST /api/v1/teams` - Create team (admin only)
- `PUT /api/v1/teams/:id` - Update team

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Database Connection Issues**
- Verify Supabase credentials in `.env.local`
- Check Supabase project status
- Verify RLS policies are enabled

**Authentication Issues**
- Clear browser storage and cookies
- Verify NEXTAUTH_SECRET is set
- Check Supabase Auth configuration

## 🤝 Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes following coding standards
3. Run tests and type checking
4. Submit pull request
5. Code review and merge

### Coding Standards
- Use TypeScript strict mode
- Follow Material Design 3 patterns
- Implement proper error handling
- Add JSDoc documentation for public APIs
- Write tests for business logic

## 📝 License

Private license - Athletic Labs proprietary software.

## 🆘 Support

For technical issues or questions:
- Check troubleshooting section above
- Review API documentation
- Contact development team

---

**Version**: 1.0.0  
**Last Updated**: September 2025