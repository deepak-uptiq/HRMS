const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Service configurations
const services = {
  auth: {
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/auth': ''
    }
  },
  employee: {
    target: process.env.EMPLOYEE_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/employee': ''
    }
  },
  leave: {
    target: process.env.LEAVE_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/leaves': ''
    }
  },
  notification: {
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/notifications': ''
    }
  },
  payroll: {
    target: process.env.PAYROLL_SERVICE_URL || 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/api/v1/payroll': ''
    }
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Service health check endpoints
app.get('/api/v1/auth/health', createProxyMiddleware({
  target: services.auth.target,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/auth': '' }
}));
app.get('/api/v1/employee/health', createProxyMiddleware({
  target: services.employee.target,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/employee': '' }
}));
app.get('/api/v1/leave/health', createProxyMiddleware({
  target: services.leave.target,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/leave': '' }
}));
app.get('/api/v1/payslip/health', createProxyMiddleware({
  target: services.payroll.target,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/payslip': '' }
}));
app.get('/api/v1/announcement/health', createProxyMiddleware({
  target: services.notification.target,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/announcement': '' }
}));

// Proxy routes
app.use('/api/v1/auth', createProxyMiddleware(services.auth));
app.use('/api/v1/employee', createProxyMiddleware(services.employee));
app.use('/api/v1/leave', createProxyMiddleware(services.leave));
app.use('/api/v1/attendance', createProxyMiddleware(services.leave));
app.use('/api/v1/department', createProxyMiddleware(services.employee));
app.use('/api/v1/position', createProxyMiddleware(services.employee));
app.use('/api/v1/performance', createProxyMiddleware(services.employee));
app.use('/api/v1/announcement', createProxyMiddleware(services.notification));
app.use('/api/v1/company', createProxyMiddleware(services.notification));
app.use('/api/v1/payslip', createProxyMiddleware(services.payroll));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying to services:`);
  Object.entries(services).forEach(([name, config]) => {
    console.log(`   ${name}: ${config.target}`);
  });
});
