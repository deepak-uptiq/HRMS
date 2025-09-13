const { PrismaClient } = require('@prisma/client');

// Create Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Test database connection
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};

