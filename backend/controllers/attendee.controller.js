const Attendee = require('../models/Attendee.model');
const Event = require('../models/Event.model');

// @desc    RSVP to an event
// @route   POST /api/attendees/rsvp
// @access  Private
const rsvpToEvent = async (req, res) => {
  try {
    const { event_id, rsvp_status = 'yes' } = req.body;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findById(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event is in the past
    if (new Date(event.date_time) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot RSVP to past events'
      });
    }
    
    // Check if event is cancelled
    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot RSVP to cancelled events'
      });
    }
    
    const result = await Attendee.rsvp(userId, event_id, rsvp_status);
    
    res.json({
      success: true,
      message: result.updated ? 'RSVP updated successfully' : 'RSVP created successfully',
      data: result
    });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing RSVP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get attendees for an event
// @route   GET /api/attendees/event/:eventId
// @access  Public
const getEventAttendees = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    const attendees = await Attendee.findByEvent(eventId);
    const stats = await Attendee.getEventStats(eventId);
    
    res.json({
      success: true,
      data: {
        attendees,
        stats
      }
    });
  } catch (error) {
    console.error('Get attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendees',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get my RSVPs
// @route   GET /api/attendees/my-rsvps
// @access  Private
const getMyRsvps = async (req, res) => {
  try {
    const userId = req.user.id;
    const rsvps = await Attendee.findByUser(userId);
    
    // Separate upcoming and past events
    const now = new Date();
    const upcoming = rsvps.filter(rsvp => new Date(rsvp.date_time) > now);
    const past = rsvps.filter(rsvp => new Date(rsvp.date_time) <= now);
    
    res.json({
      success: true,
      data: {
        upcoming,
        past,
        total: rsvps.length
      }
    });
  } catch (error) {
    console.error('Get my RSVPs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your RSVPs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get RSVP status for current user
// @route   GET /api/attendees/status/:eventId
// @access  Private
const getRsvpStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;
    
    const status = await Attendee.getRsvpStatus(userId, eventId);
    
    res.json({
      success: true,
      data: {
        hasRsvpd: !!status,
        rsvpStatus: status ? status.rsvp_status : null
      }
    });
  } catch (error) {
    console.error('Get RSVP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching RSVP status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cancel RSVP
// @route   DELETE /api/attendees/cancel/:eventId
// @access  Private
const cancelRsvp = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.eventId;
    
    // Check if RSVP exists
    const hasRsvpd = await Attendee.hasRsvpd(userId, eventId);
    if (!hasRsvpd) {
      return res.status(404).json({
        success: false,
        message: 'RSVP not found'
      });
    }
    
    const cancelled = await Attendee.cancelRsvp(userId, eventId);
    
    if (!cancelled) {
      return res.status(400).json({
        success: false,
        message: 'Failed to cancel RSVP'
      });
    }
    
    res.json({
      success: true,
      message: 'RSVP cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling RSVP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  rsvpToEvent,
  getEventAttendees,
  getMyRsvps,
  getRsvpStatus,
  cancelRsvp
};