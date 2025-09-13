const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const { connectDB, disconnectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/logger');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const hrEmployeeRoutes = require('./routes/hrEmployeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const positionRoutes = require('./routes/positionRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const employeeProfileRoutes = require('./routes/employeeRoutes');
const { setupSwagger } = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HRMS API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/employees', hrEmployeeRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/attendances', attendanceRoutes);
app.use('/api/v1/payslips', payslipRoutes);
app.use('/api/v1/performance-reviews', performanceRoutes);
app.use('/api/v1/employee', employeeProfileRoutes);

setupSwagger(app);

app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Backend Server runnig on${PORT}`);
      console.log(` API : http://localhost:${PORT}/api-docs`);
      console.log(`Health EndPoint: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

startServer();

module.exports = app;
