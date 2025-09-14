# HRMS - Human Resource Management System

A comprehensive full-stack HRMS application built with React, Node.js, Express, and PostgreSQL. This system provides complete HR management functionality including employee management, leave tracking, payroll, performance reviews, and more.

## 🚀 Quick Start

**Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs

**Quick Login:**
- **Admin**: `admin@hrms.com` / `admin123`
- **HR**: `hr@hrms.com` / `hr123456`
- **Employee**: `employee@hrms.com` / `password123`

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **Employee Management** - Complete employee lifecycle management
- **Leave Management** - Leave request and approval system
- **Payroll Management** - Salary and payslip management
- **Performance Reviews** - Employee performance tracking and reviews
- **Department & Position Management** - Organizational structure management
- **Announcements** - Company-wide communication system
- **Attendance Tracking** - Employee attendance management

### Technical Features
- **RESTful API** - Well-structured API endpoints
- **Database Integration** - PostgreSQL with Prisma ORM
- **Input Validation** - Zod schema validation
- **API Documentation** - Swagger/OpenAPI documentation
- **Logging** - Winston and Morgan logging
- **Error Handling** - Centralized error handling
- **Docker Support** - Containerized deployment
- **AI Integration** - RAG-powered Q&A assistant

## 🏗️ Project Architecture

### System Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        HRMS System Architecture                │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • User Interface (Tailwind CSS)                       │   │
│  │  • State Management (React Context)                    │   │
│  │  • Routing (React Router)                              │   │
│  │  • AI Assistant (RAG Integration)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Node.js + Express) - Monolithic                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • RESTful API Endpoints                               │   │
│  │  • JWT Authentication                                  │   │
│  │  • Input Validation (Zod)                              │   │
│  │  • Error Handling                                      │   │
│  │  • Logging (Winston + Morgan)                          │   │
│  │  • API Documentation (Swagger)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Database Layer                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • PostgreSQL Database                                 │   │
│  │  • Prisma ORM                                          │   │
│  │  • Data Models & Migrations                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Monolithic Backend Architecture
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with role-based access control
- **Validation**: Zod schema validation
- **Documentation**: Swagger/OpenAPI documentation
- **Logging**: Winston and Morgan logging
- **Error Handling**: Centralized error handling middleware
- **Security**: Helmet, CORS, Rate limiting

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API for global state
- **Routing**: React Router for navigation
- **Build Tool**: Vite for fast development and building
- **HTTP Client**: Axios for API communication
- **Error Handling**: Error boundaries for graceful error handling

### Database Schema
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │   Employees     │    │  Departments    │
│  - id           │◄──►│  - id           │◄──►│  - id           │
│  - username     │    │  - firstName    │    │  - name         │
│  - email        │    │  - lastName     │    │  - description  │
│  - password     │    │  - email        │    └─────────────────┘
│  - role         │    │  - phone        │
│  - isActive     │    │  - address      │    ┌─────────────────┐
└─────────────────┘    │  - salary       │◄──►│   Positions     │
                       │  - hireDate     │    │  - id           │
┌─────────────────┐    │  - isActive     │    │  - title        │
│     Leaves      │◄──►│  - userId       │    │  - description  │
│  - id           │    └─────────────────┘    │  - level        │
│  - type         │                           └─────────────────┘
│  - startDate    │
│  - endDate      │    ┌─────────────────┐    ┌─────────────────┐
│  - reason       │    │   Payslips      │◄──►│ Performance     │
│  - status       │    │  - id           │    │   Reviews       │
│  - employeeId   │    │  - month        │    │  - id           │
└─────────────────┘    │  - year         │    │  - period       │
                       │  - basicSalary  │    │  - goals        │
┌─────────────────┐    │  - allowances   │    │  - achievements │
│ Announcements   │    │  - deductions   │    │  - rating       │
│  - id           │    │  - netSalary    │    │  - feedback     │
│  - title        │    │  - status       │    │  - status       │
│  - content      │    │  - employeeId   │    │  - employeeId   │
│  - endDate      │    └─────────────────┘    └─────────────────┘
│  - isActive     │
└─────────────────┘
```

### Microservices Architecture (Alternative)
*Note: Initially attempted microservices architecture but encountered integration issues, so reverted to monolithic approach for better stability and easier maintenance.*

- **API Gateway** - Request routing and load balancing
- **Auth Service** - Authentication and authorization
- **Employee Service** - Employee management
- **Leave Service** - Leave management
- **Payroll Service** - Payroll processing
- **Notification Service** - Email and notification handling

## 📁 Project Structure

```
HRMS3/
├── Backend/                    # Monolithic backend
│   ├── src/
│   │   ├── config/            # Database, logger, swagger config
│   │   ├── controllers/       # Business logic controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── routes/           # API routes
│   │   └── validators/       # Input validation schemas
│   ├── prisma/               # Database schema and migrations
│   └── Dockerfile           # Backend containerization
├── Frontend/HRMS/            # React frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── state/           # State management
│   │   └── config/          # Configuration files
│   └── Dockerfile           # Frontend containerization
├── Microservices/           # Microservices architecture
│   ├── api-gateway/         # API Gateway service
│   ├── auth-service/        # Authentication service
│   ├── employee-service/    # Employee management service
│   ├── leave-service/       # Leave management service
│   ├── payroll-service/     # Payroll service
│   ├── notification-service/ # Notification service
│   └── shared/              # Shared utilities and schemas
├── docker-compose.yml       # Docker orchestration
└── .gitignore              # Git ignore rules
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Docker & Docker Compose (optional)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HRMS3
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

### Manual Setup

1. **Backend Setup**
   ```bash
   cd Backend
   npm install
   cp config.env.example config.env
   # Update config.env with your database credentials
   npx prisma db push
   npx prisma db seed
   npm start
   ```

2. **Frontend Setup**
   ```bash
   cd Frontend/HRMS
   npm install
   npm run dev
   ```

## 🔐 Default Credentials

### Administrator Account
- **Email**: `admin@hrms.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Access**: Full system access, user management, company settings, audit logs

### HR Manager Account
- **Email**: `hr@hrms.com`
- **Password**: `hr123456`
- **Role**: HR
- **Access**: Employee management, leave approvals, payroll, performance reviews

### Employee Accounts

#### Primary Employee
- **Email**: `employee@hrms.com`
- **Password**: `password123`
- **Role**: EMPLOYEE
- **Access**: Personal profile, leave requests, payslips, performance reviews

#### Sample Employees (for testing)
- **Alice Johnson**: `alice.johnson@hrms.com` / `password123`
  - **Role**: EMPLOYEE
  - **Department**: Engineering
  - **Position**: Senior Software Engineer
  - **Salary**: ₹75,000

- **Bob Smith**: `bob.smith@hrms.com` / `password123`
  - **Role**: EMPLOYEE
  - **Department**: Marketing
  - **Position**: Marketing Manager
  - **Salary**: ₹65,000

- **Carol Williams**: `carol.williams@hrms.com` / `password123`
  - **Role**: EMPLOYEE
  - **Department**: Finance
  - **Position**: Financial Analyst
  - **Salary**: ₹80,000

### Additional Test Employees
- **David Brown**: `david.brown@hrms.com` / `password123`
- **Emma Davis**: `emma.davis@hrms.com` / `password123`
- **Frank Miller**: `frank.miller@hrms.com` / `password123`
- **Grace Wilson**: `grace.wilson@hrms.com` / `password123`
- **Henry Moore**: `henry.moore@hrms.com` / `password123`
- **Ivy Taylor**: `ivy.taylor@hrms.com` / `password123`
- **Jack Anderson**: `jack.anderson@hrms.com` / `password123`

> **Note**: All employee passwords are `password123` for easy testing. In production, ensure strong, unique passwords are used.

## 📚 API Documentation

The API documentation is available at `/api-docs` when the backend is running. It includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses

## 🎯 Key Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout

### Employee Management
- `GET /api/v1/employees` - Get all employees
- `POST /api/v1/employees` - Create new employee
- `PUT /api/v1/employees/:id` - Update employee
- `DELETE /api/v1/employees/:id` - Delete employee

### Leave Management
- `GET /api/v1/leaves` - Get all leave requests
- `POST /api/v1/leaves` - Create leave request
- `PATCH /api/v1/leaves/:id` - Update leave status

### Payroll
- `GET /api/v1/payslips` - Get payslips
- `POST /api/v1/payslips` - Generate payslip
- `GET /api/v1/payslips/:id` - Get specific payslip

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hrms_db"
JWT_SECRET="your-jwt-secret"
NODE_ENV="development"
PORT=5000
```

**Frontend**
- API URL configuration in `src/config/env.ts`

## 🏗️ Architecture

The HRMS platform uses a monolithic backend architecture with a React frontend. The microservices folder is preserved for future reference.

## 🐳 Docker Deployment

### Monolithic Deployment
```bash
docker-compose up --build
```

### Microservices Deployment
```bash
cd Microservices
docker-compose up --build
```

## 🧪 Testing

### Backend API Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend/HRMS
npm test
```

##  Database Schema

The database includes the following main entities:
- **Users** - Authentication and user management
- **Employees** - Employee information and profiles
- **Departments** - Organizational departments
- **Positions** - Job positions and roles
- **Leaves** - Leave requests and approvals
- **Payslips** - Salary and payroll information
- **Performance Reviews** - Employee performance tracking
- **Announcements** - Company announcements

## 🤖AI Features

The system includes a RAG (Retrieval-Augmented Generation) powered Q&A assistant that can answer questions about:
- HR policies and procedures
- Leave policies
- Payroll information
- Company benefits
- General HR queries

##  Deployment

### Production Deployment
1. Set up production environment variables
2. Configure database for production
3. Build and deploy using Docker
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates

### Environment-Specific Configurations
- **Development**: Local database, debug logging
- **Staging**: Staging database, limited logging
- **Production**: Production database, error logging only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License.

##  Support

For support and questions:
- Check the API documentation
- Review the code comments
- Create an issue in the repository

## Version History

- **v1.0.0** - Initial release with core HR functionality
- **v1.1.0** - Added Docker support and microservices architecture
- **v1.2.0** - Added AI integration and RAG assistant
- **v1.3.0** - Enhanced UI/UX and performance improvements

---
