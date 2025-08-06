import api from './api';

const attendeeService = {
  // RSVP to an event
  rsvpToEvent: async (eventId, rsvpStatus = 'yes') => {
    const response = await api.post('/attendees/rsvp', {
      event_id: eventId,
      rsvp_status: rsvpStatus
    });
    return response.data;
  },

  // Get attendees for an event
  getEventAttendees: async (eventId) => {
    const response = await api.get(`/attendees/event/${eventId}`);
    return response.data;
  },

  // Get my RSVPs
  getMyRsvps: async () => {
    const response = await api.get('/attendees/my-rsvps');
    return response.data;
  },

  // Get RSVP status for current user
  getRsvpStatus: async (eventId) => {
    const response = await api.get(`/attendees/status/${eventId}`);
    return response.data;
  },

  // Cancel RSVP
  cancelRsvp: async (eventId) => {
    const response = await api.delete(`/attendees/cancel/${eventId}`);
    return response.data;
  }
};

export default attendeeService;