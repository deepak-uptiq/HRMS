# HRMS Microservices

This directory contains the microservices architecture for the HRMS system.

## Services

- **API Gateway** (Port 3000) - Routes requests to appropriate services
- **Auth Service** (Port 3001) - Authentication and user management
- **Employee Service** (Port 3002) - Employee, department, position, and performance management
- **Leave Service** (Port 3003) - Leave and attendance management
- **Payroll Service** (Port 3004) - Payroll and payslip management
- **Notification Service** (Port 3005) - Announcements and notifications

## Quick Start

### Development Mode
```bash
# Install dependencies for all services
npm run install:all

# Start all services in development mode
npm run dev
```

### Docker Mode
```bash
# Start all services with Docker
npm run start:all

# Stop all services
npm run stop:all
```

## Individual Service Management

```bash
# Start specific service
cd auth-service && npm run dev

# Install dependencies for specific service
cd employee-service && npm install
```

## API Endpoints

All API endpoints are available through the API Gateway at `http://localhost:3000`

- Authentication: `/api/v1/auth/*`
- Users: `/api/v1/users/*`
- Employees: `/api/v1/employees/*`
- Departments: `/api/v1/departments/*`
- Positions: `/api/v1/positions/*`
- Performance Reviews: `/api/v1/performance-reviews/*`
- Leaves: `/api/v1/leaves/*`
- Attendances: `/api/v1/attendances/*`
- Payslips: `/api/v1/payslips/*`
- Announcements: `/api/v1/announcements/*`
- Company: `/api/v1/company/*`

## Frontend Configuration

Update your frontend configuration to use the API Gateway:

```typescript
// Frontend/HRMS/src/config/env.ts
export const config = {
  apiUrl: 'http://localhost:3000' // API Gateway
}
```

## Database

All services share the same PostgreSQL database. Each service has its own database connection but uses the same schema.

## Migration from Monolithic

This microservices architecture preserves all existing functionality from the monolithic backend while providing better scalability and maintainability.