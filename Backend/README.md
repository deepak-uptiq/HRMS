# HRMS Backend API

A comprehensive Human Resource Management System backend built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- **RESTful API** with Express.js
- **Database ORM** with Prisma
- **Input Validation** with Zod
- **Logging** with Winston and Morgan
- **Error Handling** with centralized exception handling
- **API Documentation** with Swagger
- **Security** with Helmet and CORS
- **Rate Limiting** for API protection

## Database Schema

The system includes the following entities:
- **Employee**: Core employee information
- **Department**: Organizational departments
- **Position**: Job positions and levels
- **Leave**: Leave requests and management
- **Attendance**: Employee attendance tracking

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `config.env` and update the database connection details:
   ```env
   DB_USER=hrmsUser
   DB_PASSWORD=deepak#4090
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE=hrms
   PORT=5000
   NODE_ENV=development
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Employees
- `GET /api/v1/employees` - Get all employees
- `GET /api/v1/employees/:id` - Get employee by ID
- `POST /api/v1/employees` - Create new employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Departments
- `GET /api/v1/departments` - Get all departments
- `GET /api/v1/departments/:id` - Get department by ID
- `POST /api/v1/departments` - Create new department
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department

### Positions
- `GET /api/v1/positions` - Get all positions
- `GET /api/v1/positions/:id` - Get position by ID
- `POST /api/v1/positions` - Create new position
- `PUT /api/v1/positions/:id` - Update position
- `DELETE /api/v1/positions/:id` - Delete position

### Leaves
- `GET /api/v1/leaves` - Get all leave requests
- `GET /api/v1/leaves/:id` - Get leave by ID
- `POST /api/v1/leaves` - Create new leave request
- `PUT /api/v1/leaves/:id` - Update leave request
- `DELETE /api/v1/leaves/:id` - Delete leave request

### Attendance
- `GET /api/v1/attendances` - Get all attendance records
- `GET /api/v1/attendances/:id` - Get attendance by ID
- `POST /api/v1/attendances` - Create new attendance record
- `PUT /api/v1/attendances/:id` - Update attendance record
- `DELETE /api/v1/attendances/:id` - Delete attendance record

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## Database Management

- **Prisma Studio**: `npm run db:studio` - Visual database editor
- **Generate Client**: `npm run db:generate` - Generate Prisma client
- **Push Schema**: `npm run db:push` - Push schema changes to database
- **Migrate**: `npm run db:migrate` - Run database migrations

## Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error level logs
- `combined.log` - All logs combined

## Error Handling

The API includes comprehensive error handling:
- Input validation errors
- Database constraint errors
- Not found errors
- Server errors

All errors are logged and returned in a consistent format.

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting (100 requests per 15 minutes)
- **Input Validation**: All inputs validated with Zod schemas

## Development

The server runs in development mode with:
- Hot reloading with nodemon
- Detailed error messages
- Console logging
- Database query logging
