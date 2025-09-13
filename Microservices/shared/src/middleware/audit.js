const { prisma } = require('../config/database');
const logger = require('../config/logger');

// Audit logging middleware
const auditLog = (action, entity, options = {}) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    let responseBody;

    // Capture response body
    res.send = function(body) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    // Log after response is sent
    res.on('finish', async () => {
      try {
        if (req.user && responseBody) {
          const response = JSON.parse(responseBody);
          
          // Only log successful operations
          if (res.statusCode >= 200 && res.statusCode < 300) {
            await prisma.auditLog.create({
              data: {
                action,
                entity,
                entityId: req.params.id || req.params.employeeId || null,
                oldValues: options.captureOldValues ? req.oldValues : null,
                newValues: options.captureNewValues ? req.body : null,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                userId: req.user.id
              }
            });
          }
        }
      } catch (error) {
        logger.error('Audit logging error:', error);
      }
    });

    next();
  };
};

// Middleware to capture old values for updates
const captureOldValues = async (req, res, next) => {
  if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
    try {
      const entityId = req.params.id || req.params.employeeId;
      if (entityId) {
        // Get the entity based on the route
        let oldData = null;
        
        if (req.route.path.includes('/employees')) {
          oldData = await prisma.employee.findUnique({
            where: { id: entityId },
            include: {
              department: true,
              position: true
            }
          });
        } else if (req.route.path.includes('/departments')) {
          oldData = await prisma.department.findUnique({
            where: { id: entityId }
          });
        } else if (req.route.path.includes('/positions')) {
          oldData = await prisma.position.findUnique({
            where: { id: entityId }
          });
        } else if (req.route.path.includes('/leaves')) {
          oldData = await prisma.leave.findUnique({
            where: { id: entityId },
            include: {
              employee: true
            }
          });
        } else if (req.route.path.includes('/attendances')) {
          oldData = await prisma.attendance.findUnique({
            where: { id: entityId },
            include: {
              employee: true
            }
          });
        }
        
        req.oldValues = oldData;
      }
    } catch (error) {
      logger.error('Error capturing old values:', error);
    }
  }
  next();
};

module.exports = {
  auditLog,
  captureOldValues
};
