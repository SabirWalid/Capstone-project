const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// Get all resources (public view)
router.get('/', async (req, res) => {
    try {
        const { category, search, sort = 'newest' } = req.query;
        
        // Build query
        const query = { isActive: true };
        if (category) {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        // Build sort
        let sortOptions = {};
        switch (sort) {
            case 'popular':
                sortOptions = { views: -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'newest':
            default:
                sortOptions = { createdAt: -1 };
        }
        
        const resources = await Resource.find(query)
            .sort(sortOptions)
            .select('-__v')
            .populate('creator', 'name avatar')
            .lean()
            .exec()
            .then(resources => resources.map(resource => ({
                ...resource,
                creator: resource.creator || { name: 'System', avatar: null }
            })));
            
        const totalCount = await Resource.countDocuments(query);
        
        res.json({
            resources,
            total: totalCount,
            filters: {
                category,
                search,
                sort
            }
        });
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .select('-__v');
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        if (resource.isActive !== true) {
            return res.status(404).json({ error: 'Resource not available' });
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

// Get resources by category
router.get('/category/:category', async (req, res) => {
    try {
        const resources = await Resource.find({ 
            category: req.params.category,
            isActive: true
        })
        .sort({ createdAt: -1 })
        .select('-__v');
        
        res.json(resources);
    } catch (error) {
        console.error('Error fetching resources by category:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Search resources
router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const resources = await Resource.find({
            isActive: true,
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ]
        })
        .sort({ createdAt: -1 })
        .select('-__v');
        
        res.json(resources);
    } catch (error) {
        console.error('Error searching resources:', error);
        res.status(500).json({ error: 'Failed to search resources' });
    }
});

// Download resource (increment download count)
router.post('/:id/download', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        if (resource.isActive !== true) {
            return res.status(404).json({ error: 'Resource not available' });
        }
        
        // Increment download count
        resource.downloadCount = (resource.downloadCount || 0) + 1;
        await resource.save();
        
        res.json({ 
            message: 'Download recorded',
            downloadUrl: resource.fileUrl,
            downloadCount: resource.downloadCount
        });
    } catch (error) {
        console.error('Error recording download:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid resource ID' });
        }
        res.status(500).json({ error: 'Failed to record download' });
    }
});

module.exports = router;