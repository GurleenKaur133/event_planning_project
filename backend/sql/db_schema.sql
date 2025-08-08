-- Complete Event Planning Platform Database Setup
-- FINAL VERSION - All queries included

-- 1. Create Database
DROP DATABASE IF EXISTS eventmanager;
CREATE DATABASE eventmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventmanager;

-- 2. Create Users Table (with all columns from the start)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin', 'organizer') DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Create Venues Table
CREATE TABLE venues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Create Events Table
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date_time DATETIME NOT NULL,
  venue_id INT,
  created_by INT NOT NULL,
  status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Create Attendees Table
CREATE TABLE attendees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  rsvp_status ENUM('yes', 'no', 'maybe', 'waitlist') DEFAULT 'yes',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_event (user_id, event_id)
);

-- 6. Add Foreign Key Constraints
ALTER TABLE events 
  ADD CONSTRAINT fk_events_creator 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE events 
  ADD CONSTRAINT fk_events_venue 
  FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL;

ALTER TABLE attendees 
  ADD CONSTRAINT fk_attendees_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE attendees 
  ADD CONSTRAINT fk_attendees_event 
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- 7. Create Indexes for Performance
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_events_date ON events(date_time);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_attendees_rsvp_status ON attendees(rsvp_status);

-- 8. Create Views
CREATE VIEW event_details AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.date_time,
    e.status,
    e.created_at,
    e.updated_at,
    v.name AS venue_name,
    v.location AS venue_location,
    v.capacity AS venue_capacity,
    u.username AS creator_username,
    u.email AS creator_email,
    (
      SELECT COUNT(*) 
      FROM attendees 
      WHERE event_id = e.id 
        AND rsvp_status = 'yes'
    ) AS confirmed_attendees
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
LEFT JOIN users u ON e.created_by = u.id;

CREATE VIEW user_created_events AS
SELECT 
    u.id AS user_id,
    u.username,
    e.*
FROM users u
JOIN events e ON u.id = e.created_by;

CREATE VIEW user_attending_events AS
SELECT 
    u.id AS user_id,
    u.username,
    e.*,
    a.rsvp_status,
    a.created_at AS rsvp_date
FROM users u
JOIN attendees a ON u.id = a.user_id
JOIN events e ON a.event_id = e.id;

-- 9. Create Stored Procedures
DELIMITER //

CREATE PROCEDURE rsvp_to_event(
    IN p_user_id INT,
    IN p_event_id INT,
    IN p_rsvp_status ENUM('yes', 'no', 'maybe', 'waitlist')
)
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM attendees 
        WHERE user_id = p_user_id 
          AND event_id = p_event_id
    ) THEN
        UPDATE attendees 
        SET rsvp_status = p_rsvp_status, 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id 
          AND event_id = p_event_id;
    ELSE
        INSERT INTO attendees (user_id, event_id, rsvp_status)
        VALUES (p_user_id, p_event_id, p_rsvp_status);
    END IF;
END //

CREATE PROCEDURE get_event_stats(IN p_event_id INT)
BEGIN
    SELECT 
        COUNT(CASE WHEN rsvp_status = 'yes' THEN 1 END) AS confirmed,
        COUNT(CASE WHEN rsvp_status = 'maybe' THEN 1 END) AS maybe,
        COUNT(CASE WHEN rsvp_status = 'no' THEN 1 END) AS declined,
        COUNT(CASE WHEN rsvp_status = 'waitlist' THEN 1 END) AS waitlisted,
        COUNT(*) AS total_responses
    FROM attendees
    WHERE event_id = p_event_id;
END //

DELIMITER ;

-- 10. Create Triggers
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
    WHERE event_id = NEW.event_id 
      AND rsvp_status = 'yes';

    IF NEW.rsvp_status = 'yes' 
       AND current_attendees >= venue_cap 
    THEN
        SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Event is at full capacity. User added to waitlist.';
        SET NEW.rsvp_status = 'waitlist';
    END IF;
END //

DELIMITER ;

-- 11. Insert Test Data

-- Insert test users (password for all is 'password123')
-- The hash below is for 'password123' with bcrypt
INSERT INTO users (username, name, email, password, role) VALUES
  ('testuser', 'Test User', 'test@example.com', '$2a$10$kEJ3aUxEybw0NBCVxLRS1edNqqn8Zw3vCgYMoaXXhd7YfJlM8HWmm', 'user'),
  ('admin', 'Admin User', 'admin@example.com', '$2a$10$kEJ3aUxEybw0NBCVxLRS1edNqqn8Zw3vCgYMoaXXhd7YfJlM8HWmm', 'admin'),
  ('organizer', 'Event Organizer', 'organizer@example.com', '$2a$10$kEJ3aUxEybw0NBCVxLRS1edNqqn8Zw3vCgYMoaXXhd7YfJlM8HWmm', 'organizer'),
  ('john_doe', 'John Doe', 'john@example.com', '$2a$10$kEJ3aUxEybw0NBCVxLRS1edNqqn8Zw3vCgYMoaXXhd7YfJlM8HWmm', 'user'),
  ('Dipak2', 'Dipak2', 'dipak2@gmail.com', '$2a$10$kEJ3aUxEybw0NBCVxLRS1edNqqn8Zw3vCgYMoaXXhd7YfJlM8HWmm', 'admin'),
  ('jane_smith', 'Jane Smith', 'jane@example.com', '$2a$10$kEJ3aUxEybw0NBCVxLRS1edNqqn8Zw3vCgYMoaXXhd7YfJlM8HWmm', 'user');

-- Insert venues
INSERT INTO venues (name, location, capacity) VALUES
  ('Grand Conference Hall', '123 Main St, Downtown', 500),
  ('Tech Innovation Center', '456 Tech Park Ave', 200),
  ('Outdoor Amphitheater', '789 Park Road', 1000),
  ('Small Meeting Room A', '321 Business Center', 50),
  ('Virtual Event Space', 'Online', 9999);

-- Insert events (dates are in future from August 2025)
INSERT INTO events (title, description, date_time, venue_id, created_by, status) VALUES
  ('Annual Tech Conference 2025', 'Join us for the biggest tech event of the year featuring keynote speakers, workshops, and networking opportunities', '2025-09-15 09:00:00', 2, 1, 'published'),
  ('Summer Music Festival', 'Live performances from top artists across multiple genres. Food trucks and vendors on site.', '2025-10-20 16:00:00', 3, 1, 'published'),
  ('Project Management Workshop', 'Learn agile methodologies, scrum practices, and modern project management techniques', '2025-09-10 14:00:00', 4, 1, 'published'),
  ('Virtual AI Summit', 'Exploring the future of AI with industry leaders and researchers from around the world', '2025-10-05 10:00:00', 5, 1, 'published'),
  ('Networking Mixer', 'Connect with professionals from various industries in a casual setting', '2025-08-28 18:00:00', 1, 1, 'draft'),
  ('Web Development Bootcamp', 'Intensive 2-day workshop covering modern web technologies including React, Node.js, and cloud deployment', '2025-09-25 09:00:00', 2, 2, 'published'),
  ('Charity Gala Dinner', 'Annual fundraising event for local children''s hospital. Black tie event with dinner and auction.', '2025-11-15 19:00:00', 1, 3, 'published');

-- Insert test RSVPs
INSERT INTO attendees (user_id, event_id, rsvp_status) VALUES
  (1, 2, 'yes'),
  (1, 3, 'maybe'),
  (1, 6, 'yes'),
  (2, 1, 'yes'),
  (2, 2, 'no'),
  (2, 4, 'yes'),
  (3, 1, 'yes'),
  (3, 7, 'yes'),
  (4, 1, 'maybe'),
  (4, 2, 'yes'),
  (4, 3, 'yes'),
  (5, 1, 'yes'),
  (5, 4, 'yes'),
  (5, 6, 'maybe');

-- 12. Verification Queries
SELECT 'Users created:' AS Status, COUNT(*) AS Count FROM users;
SELECT 'Venues created:' AS Status, COUNT(*) AS Count FROM venues;
SELECT 'Events created:' AS Status, COUNT(*) AS Count FROM events;
SELECT 'RSVPs created:' AS Status, COUNT(*) AS Count FROM attendees;

-- Show sample data
SELECT '=== Sample Users ===' AS DataCheck;
SELECT id, username, email, role FROM users;

SELECT '=== Sample Events ===' AS DataCheck;
SELECT
    e.id,
    e.title,
    e.date_time,
    v.name AS venue,
    u.username AS created_by,
    e.status
FROM events e
JOIN venues v ON e.venue_id = v.id
JOIN users u ON e.created_by = u.id;

-- Show sample RSVPs
SELECT '=== Sample RSVPs ===' AS DataCheck;
SELECT
    u.username,
    e.title,
    a.rsvp_status
FROM attendees a
JOIN users u ON a.user_id = u.id
JOIN events e ON a.event_id = e.id
ORDER BY e.id, u.username;

-- Test the views
SELECT '=== Event Details View ===' AS DataCheck;
SELECT * FROM event_details WHERE id = 1;

-- Test stored procedures
SELECT '=== Event Stats for Event 1 ===' AS DataCheck;
CALL get_event_stats(1);
ALTER TABLE users MODIFY COLUMN name VARCHAR(100) NULL;
UPDATE users SET role = 'admin' WHERE email = 'dipak2@gmail.com';

//manually setting name and username to Dipak2 and password to Password123 and email to dipak2@gmail.com and role to admin.
