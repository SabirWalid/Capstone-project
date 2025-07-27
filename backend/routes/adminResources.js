const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const multer = require('multer');
const path = require('path');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/resources/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow specific file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Middleware to check admin authentication
const requireAuth = (req, res, next) => {
    // Add your authentication logic here
    // For now, we'll assume authentication is handled elsewhere
    next();
};

// Get all resources (admin view)
router.get('/', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const resources = await Resource.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-__v');
            
        const total = await Resource.countDocuments();
        
        res.json({
            resources,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Get resource by ID (admin view)
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        res.json(resource);
    } catch (error) {
        console.error('Error fetching resource:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid resource ID' });
        }
        res.status(500).json({ error: 'Failed to fetch resource' });
    }
});

// Create new resource
router.post('/', adminAuth, upload.single('file'), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { title, url, description, category, tags, status, type } = req.body;

        // Validate required fields
        if (!url) {
            return res.status(400).json({ 
                error: 'Validation Error', 
                message: 'URL is required' 
            });
        }
        
        if (!type) {
            return res.status(400).json({ 
                error: 'Validation Error', 
                message: 'Type is required' 
            });
        }

        if (!title || !description || !category) {
            return res.status(400).json({ 
                error: 'Title, description, and category are required' 
            });
        }

        // Ensure tags is an array
        let tagsArray = [];
        if (typeof tags === 'string') {
            tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
        } else if (Array.isArray(tags)) {
            tagsArray = tags;
        }

        const resourceData = {
            title,
            url,
            type: req.body.type || 'Link', // Default to 'Link' if not provided
            description,
            category,
            tags: tagsArray,
            status: 'active', // Always set status to active for admin-created resources
            isActive: true // Also set isActive for compatibility
        };
        
        // Add file information if uploaded
        if (req.file) {
            resourceData.fileName = req.file.originalname;
            resourceData.fileUrl = `/uploads/resources/${req.file.filename}`;
            resourceData.fileSize = req.file.size;
            resourceData.mimeType = req.file.mimetype;
        }
        
        const resource = new Resource(resourceData);
        await resource.save();
        
        res.status(201).json(resource);
    } catch (error) {
        console.error('Error creating resource:', error);
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

// Update resource
router.put('/:id', requireAuth, upload.single('file'), async (req, res) => {
    try {
        const { title, description, category, tags, status } = req.body;
        
        const updateData = {
            title,
            description,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            status,
            updatedAt: new Date()
        };
        
        // Update file information if new file uploaded
        if (req.file) {
            updateData.fileName = req.file.originalname;
            updateData.fileUrl = `/uploads/resources/${req.file.filename}`;
            updateData.fileSize = req.file.size;
            updateData.mimeType = req.file.mimetype;
        }
        
        const resource = await Resource.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        res.json(resource);
    } catch (error) {
        console.error('Error updating resource:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid resource ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// Delete resource
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const resource = await Resource.findByIdAndDelete(req.params.id);
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        // TODO: Delete associated file from filesystem
        // const fs = require('fs');
        // if (resource.fileUrl) {
        //     fs.unlink(path.join(__dirname, '..', resource.fileUrl), (err) => {
        //         if (err) console.error('Error deleting file:', err);
        //     });
        // }
        
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid resource ID' });
        }
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// Bulk operations
router.post('/bulk', requireAuth, async (req, res) => {
    try {
        const { action, ids } = req.body;
        
        if (!action || !ids || !Array.isArray(ids)) {
            return res.status(400).json({ 
                error: 'Action and resource IDs are required' 
            });
        }
        
        let result;
        
        switch (action) {
            case 'delete':
                result = await Resource.deleteMany({ _id: { $in: ids } });
                break;
            case 'activate':
                result = await Resource.updateMany(
                    { _id: { $in: ids } },
                    { status: 'active', updatedAt: new Date() }
                );
                break;
            case 'deactivate':
                result = await Resource.updateMany(
                    { _id: { $in: ids } },
                    { status: 'inactive', updatedAt: new Date() }
                );
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
        
        res.json({ 
            message: `Bulk ${action} completed`,
            affected: result.modifiedCount || result.deletedCount
        });
    } catch (error) {
        console.error('Error performing bulk operation:', error);
        res.status(500).json({ error: 'Failed to perform bulk operation' });
    }
});

// Get resource statistics
router.get('/stats/overview', requireAuth, async (req, res) => {
    try {
        const totalResources = await Resource.countDocuments();
        const activeResources = await Resource.countDocuments({ status: 'active' });
        const inactiveResources = await Resource.countDocuments({ status: 'inactive' });
        
        // Get resources by category
        const categoryStats = await Resource.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get total downloads
        const downloadStats = await Resource.aggregate([
            { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
        ]);
        
        res.json({
            overview: {
                total: totalResources,
                active: activeResources,
                inactive: inactiveResources
            },
            categories: categoryStats,
            totalDownloads: downloadStats[0]?.totalDownloads || 0
        });
    } catch (error) {
        console.error('Error fetching resource statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;