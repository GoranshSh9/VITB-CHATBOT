// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection with improved options and error handling
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitq_chatbot', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure if database connection fails
});

// Proper mongoose connection error handling
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Handle application termination - close mongoose connection
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
    });
});

// Create Inquiry Schema with validation
const inquirySchema = new mongoose.Schema({
    program: {
        type: String,
        required: [true, 'Program is required'],
        enum: ['btech', 'mtech', 'bba', 'mba'] // Validate allowed programs
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[0-9]{10,14}$/, 'Please enter a valid phone number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        lowercase: true,
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    dob: {
        type: String,
        required: [true, 'Date of birth is required']
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

// Create Inquiry Model
const Inquiry = mongoose.model('Inquiry', inquirySchema);

// API Routes with improved error handling
app.post('/api/inquiries', async (req, res) => {
    try {
        // Create new inquiry from request body
        const newInquiry = new Inquiry(req.body);
        
        // Validate data according to schema
        await newInquiry.validate();
        
        // Save to database
        const savedInquiry = await newInquiry.save();
        
        // Return success response
        res.status(201).json({
            success: true,
            message: 'Inquiry saved successfully',
            data: savedInquiry
        });
    } catch (error) {
        console.error('Error saving inquiry:', error);
        
        // Handle validation errors specifically
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            
            // Extract field-specific validation errors
            for (const field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        
        // Handle duplicate key errors (e.g., if email must be unique)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A record with this information already exists',
                error: error.message
            });
        }
        
        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Failed to save inquiry',
            error: error.message
        });
    }
});

// Get all inquiries - for admin purposes with pagination
app.get('/api/inquiries', async (req, res) => {
    try {
        // Add pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get total count for pagination info
        const total = await Inquiry.countDocuments();
        
        // Query with pagination and sorting
        const inquiries = await Inquiry.find()
            .sort({ submissionDate: -1 })
            .skip(skip)
            .limit(limit);
        
        res.status(200).json({
            success: true,
            count: inquiries.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inquiries',
            error: error.message
        });
    }
});

// Get a single inquiry by ID
app.get('/api/inquiries/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error('Error fetching inquiry:', error);
        
        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid inquiry ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inquiry',
            error: error.message
        });
    }
});

// Delete an inquiry (for admin purposes)
app.delete('/api/inquiries/:id', async (req, res) => {
    try {
        const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
        
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Inquiry deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting inquiry:', error);
        
        // Handle invalid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid inquiry ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to delete inquiry',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});