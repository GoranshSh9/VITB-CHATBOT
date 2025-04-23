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

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitq_chatbot', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Create Inquiry Schema
const inquirySchema = new mongoose.Schema({
    program: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

// Create Inquiry Model
const Inquiry = mongoose.model('Inquiry', inquirySchema);

// API Routes
app.post('/api/inquiries', async (req, res) => {
    try {
        // Create new inquiry from request body
        const newInquiry = new Inquiry(req.body);
        
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
        res.status(500).json({
            success: false,
            message: 'Failed to save inquiry',
            error: error.message
        });
    }
});

// Get all inquiries - for admin purposes
app.get('/api/inquiries', async (req, res) => {
    try {
        const inquiries = await Inquiry.find().sort({ submissionDate: -1 });
        res.status(200).json({
            success: true,
            count: inquiries.length,
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

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});