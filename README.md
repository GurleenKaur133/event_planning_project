Event Planning Platform
A full-stack web application for creating, managing, and RSVPing to events with role-based access control.
🚀 Features

User Authentication: JWT-based secure login/register system
Event Management: Create, edit, delete, and manage events
Venue Management: Browse venues, admin controls for venue CRUD
RSVP System: RSVP with Yes/No/Maybe options, automatic waitlisting
Role-Based Access: User, Organizer, and Admin roles
User Dashboard: Personal statistics and event tracking
Profile Management: Update profile and change password

🛠️ Tech Stack
Frontend: React, Vite, React Router, Axios, Tailwind CSS, Context API
Backend: Node.js, Express.js, MySQL, JWT, Bcrypt
Security: Helmet, Rate Limiting, Input Validation, XSS Protection
📁 Project Structure
event-planning-platform/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth, validation, security
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── utils/         # Helper functions
└── frontend/
    ├── components/    # Reusable components
    ├── context/       # Auth context
    ├── pages/         # Application pages
    └── services/      # API services
🚀 Getting Started
Prerequisites

Node.js (v14+)
MySQL (v5.7+)
npm

Installation

Clone and setup database

bashgit clone https://github.com/GurleenKaur133/event_planning_project
cd event-planning-project
mysql -u root -p < db_schema.sql

Backend setup

bashcd backend
npm install
Create .env file:
envPORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASS=CST8250!
DB_NAME=eventmanager
JWT_SECRET=ffdeab852683582070f91c64948e5cf55a06048aa2213d62b8818478f36f86a8
JWT_EXPIRE=7d

Frontend setup

bashcd ../frontend
npm install

Run the application

bash# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
Access at: http://localhost:5173
📚 API Endpoints
Authentication

POST /api/auth/register - Register new user
POST /api/auth/login - User login
GET /api/auth/me - Get current user
POST /api/auth/logout - Logout

Events

GET /api/events - Get all events
GET /api/events/:id - Get single event
POST /api/events - Create event (Auth required)
PUT /api/events/:id - Update event (Creator only)
DELETE /api/events/:id - Cancel event (Creator only)

Venues

GET /api/venues - Get all venues
POST /api/venues - Create venue (Admin/Organizer)
PUT /api/venues/:id - Update venue (Admin)
DELETE /api/venues/:id - Delete venue (Admin)

RSVPs

POST /api/attendees/rsvp - RSVP to event
GET /api/attendees/my-rsvps - Get user's RSVPs
DELETE /api/attendees/cancel/:eventId - Cancel RSVP

👥 User Roles
User: Create events, RSVP, manage profile
Organizer: User permissions + create venues
Admin: Full system access, manage all content
🔐 Test Accounts

Admin: dipak2@gmail.com / password123
User: test@example.com / password123

👥 Team

Dipak - Backend Development
Kunal - Frontend Development
Komal - Database Architecture
Gurleen - UI/UX & Routing