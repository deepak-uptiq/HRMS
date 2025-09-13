const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../config/logger');

// Get all announcements
const getAllAnnouncements = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, type, priority, isActive, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (type) {
      where.type = type;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Filter by date range if provided
    const now = new Date();
    where.OR = [
      { startDate: null },
      { startDate: { lte: now } }
    ];
    
    where.AND = [
      {
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      }
    ];

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          createdByUser: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.announcement.count({ where })
    ]);

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: announcements
    });
  } catch (error) {
    logger.error('Error fetching announcements:', error);
    next(error);
  }
};

// Get announcement by ID
const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!announcement) {
      return next(new AppError('Announcement not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: announcement
    });
  } catch (error) {
    logger.error('Error fetching announcement:', error);
    next(error);
  }
};

// Create new announcement
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type = 'GENERAL', priority = 'NORMAL', startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return next(new AppError('End date must be after start date', 400));
      }
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: userId
      },
      include: {
        createdByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    logger.info(`New announcement created: ${announcement.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    logger.error('Error creating announcement:', error);
    next(error);
  }
};

// Update announcement
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      return next(new AppError('Announcement not found', 404));
    }

    // Validate date range if dates are being updated
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : existingAnnouncement.startDate;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : existingAnnouncement.endDate;

      if (startDate && endDate && startDate >= endDate) {
        return next(new AppError('End date must be after start date', 400));
      }
    }

    // Convert dates to Date objects if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        createdByUser: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    logger.info(`Announcement updated: ${announcement.id}`);

    res.status(200).json({
      status: 'success',
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    logger.error('Error updating announcement:', error);
    next(error);
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id }
    });

    if (!existingAnnouncement) {
      return next(new AppError('Announcement not found', 404));
    }

    await prisma.announcement.delete({
      where: { id }
    });

    logger.info(`Announcement deleted: ${id}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Error deleting announcement:', error);
    next(error);
  }
};

// Get active announcements (for employee dashboard)
const getActiveAnnouncements = async (req, res, next) => {
  try {
    const now = new Date();
    
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      include: {
        createdByUser: {
          select: {
            username: true,
            role: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10
    });

    res.status(200).json({
      status: 'success',
      results: announcements.length,
      data: announcements
    });
  } catch (error) {
    logger.error('Error fetching active announcements:', error);
    next(error);
  }
};

module.exports = {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncements
};
