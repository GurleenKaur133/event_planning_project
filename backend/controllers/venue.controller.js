const Venue = require('../models/Venue.model');

// @desc    Get all venues
// @route   GET /api/venues
// @access  Public
const getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.findAll();
    
    res.json({
      success: true,
      count: venues.length,
      data: venues
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching venues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single venue
// @route   GET /api/venues/:id
// @access  Public
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }
    
    res.json({
      success: true,
      data: venue
    });
  } catch (error) {
    console.error('Get venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching venue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new venue
// @route   POST /api/venues
// @access  Private (Admin only)
const createVenue = async (req, res) => {
  try {
    // Only admins and organizers can create venues
    if (req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create venues'
      });
    }
    
    const venueId = await Venue.create(req.body);
    const newVenue = await Venue.findById(venueId);
    
    res.status(201).json({
      success: true,
      message: 'Venue created successfully',
      data: newVenue
    });
  } catch (error) {
    console.error('Create venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating venue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Admin only)
const updateVenue = async (req, res) => {
  try {
    // Only admins can update venues
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update venues'
      });
    }
    
    const updated = await Venue.update(req.params.id, req.body);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }
    
    const updatedVenue = await Venue.findById(req.params.id);
    
    res.json({
      success: true,
      message: 'Venue updated successfully',
      data: updatedVenue
    });
  } catch (error) {
    console.error('Update venue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating venue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
// @access  Private (Admin only)
const deleteVenue = async (req, res) => {
  try {
    // Only admins can delete venues
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete venues'
      });
    }
    
    const deleted = await Venue.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Venue deleted successfully'
    });
  } catch (error) {
    console.error('Delete venue error:', error);
    
    // Check if error is about active events
    if (error.message.includes('active events')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting venue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
};