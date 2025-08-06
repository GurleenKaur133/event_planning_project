
CREATE DATABASE eventmanager;

USE eventmanager;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE venues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  location VARCHAR(255),
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  date_time DATETIME,
  venue_id INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venues(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE attendees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  event_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  UNIQUE (user_id, event_id)
);


-- Level 2: Auth-related Schema Updates
-- Author: Komal


-- 1. Foreign Key Relationships
ALTER TABLE events 
ADD CONSTRAINT fk_events_creator 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE attendees 
ADD CONSTRAINT fk_attendees_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE attendees 
ADD CONSTRAINT fk_attendees_event 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

ALTER TABLE events 
ADD CONSTRAINT fk_events_venue 
FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;

-- 2. Performance Indexes
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_attendees_user_id ON attendees(user_id);
CREATE INDEX idx_attendees_event_id ON attendees(event_id);
CREATE INDEX idx_attendees_user_event ON attendees(user_id, event_id);
CREATE INDEX idx_events_date ON events(date_time);

-- 3. Status and Tracking Columns
ALTER TABLE events 
ADD COLUMN status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'published' AFTER created_by;

ALTER TABLE attendees 
ADD COLUMN rsvp_status ENUM('yes', 'no', 'maybe', 'waitlist') DEFAULT 'yes' AFTER event_id;

ALTER TABLE events 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE venues 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE attendees 
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 4. Views
CREATE VIEW event_details AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.date_time,
    e.status,
    e.created_at,
    e.updated_at,
    v.name as venue_name,
    v.location as venue_location,
    v.capacity as venue_capacity,
    u.username as creator_username,
    u.email as creator_email,
    (SELECT COUNT(*) FROM attendees WHERE event_id = e.id AND rsvp_status = 'yes') as confirmed_attendees
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
LEFT JOIN users u ON e.created_by = u.id;

CREATE VIEW user_created_events AS
SELECT 
    u.id as user_id,
    u.username,
    e.*
FROM users u
JOIN events e ON u.id = e.created_by;

CREATE VIEW user_attending_events AS
SELECT 
    u.id as user_id,
    u.username,
    e.*,
    a.rsvp_status,
    a.created_at as rsvp_date
FROM users u
JOIN attendees a ON u.id = a.user_id
JOIN events e ON a.event_id = e.id;

-- 5. Stored Procedures
DELIMITER //
CREATE PROCEDURE rsvp_to_event(
    IN p_user_id INT,
    IN p_event_id INT,
    IN p_rsvp_status ENUM('yes', 'no', 'maybe', 'waitlist')
)
BEGIN
    IF EXISTS (SELECT 1 FROM attendees WHERE user_id = p_user_id AND event_id = p_event_id) THEN
        UPDATE attendees 
        SET rsvp_status = p_rsvp_status, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id AND event_id = p_event_id;
    ELSE
        INSERT INTO attendees (user_id, event_id, rsvp_status)
        VALUES (p_user_id, p_event_id, p_rsvp_status);
    END IF;
END //

CREATE PROCEDURE get_event_stats(IN p_event_id INT)
BEGIN
    SELECT 
        COUNT(CASE WHEN rsvp_status = 'yes' THEN 1 END) as confirmed,
        COUNT(CASE WHEN rsvp_status = 'maybe' THEN 1 END) as maybe,
        COUNT(CASE WHEN rsvp_status = 'no' THEN 1 END) as declined,
        COUNT(CASE WHEN rsvp_status = 'waitlist' THEN 1 END) as waitlisted,
        COUNT(*) as total_responses
    FROM attendees
    WHERE event_id = p_event_id;
END //
DELIMITER ;

-- 6. Trigger
DELIMITER //
CREATE TRIGGER check_event_capacity 
BEFORE INSERT ON attendees
FOR EACH ROW
BEGIN
    DECLARE venue_cap INT;
    DECLARE current_attendees INT;
    
    SELECT v.capacity INTO venue_cap
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    WHERE e.id = NEW.event_id;
    
    SELECT COUNT(*) INTO current_attendees
    FROM attendees
    WHERE event_id = NEW.event_id AND rsvp_status = 'yes';
    
    IF NEW.rsvp_status = 'yes' AND current_attendees >= venue_cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Event is at full capacity. User added to waitlist.';
        SET NEW.rsvp_status = 'waitlist';
    END IF;
END //
DELIMITER ;

-- 7. Test Data
INSERT INTO venues (name, location, capacity) VALUES
('Grand Conference Hall', '123 Main St, Downtown', 500),
('Tech Innovation Center', '456 Tech Park Ave', 200),
('Outdoor Amphitheater', '789 Park Road', 1000),
('Small Meeting Room A', '321 Business Center', 50),
('Virtual Event Space', 'Online', 9999);

INSERT INTO events (title, description, date_time, venue_id, created_by, status) VALUES
('Annual Tech Conference 2025', 'Join us for the biggest tech event of the year', '2025-03-15 09:00:00', 2, 1, 'published'),
('Summer Music Festival', 'Live performances from top artists', '2025-07-20 16:00:00', 3, 1, 'published'),
('Project Management Workshop', 'Learn agile methodologies', '2025-02-10 14:00:00', 4, 1, 'published'),
('Virtual AI Summit', 'Exploring the future of AI', '2025-04-05 10:00:00', 5, 1, 'published'),
('Networking Mixer', 'Connect with professionals', '2025-02-28 18:00:00', 1, 1, 'draft');

INSERT INTO attendees (user_id, event_id, rsvp_status) VALUES
(1, 1, 'yes'),
(1, 2, 'maybe'),
(1, 3, 'yes');
 
 // Important Queries for everyone 
-- Add missing columns to users table
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER id;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true AFTER role;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Update role enum to include 'organizer'
ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'organizer') DEFAULT 'user';

-- Create indexes
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);