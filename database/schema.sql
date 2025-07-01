-- Chung Hua Middle School BSB - Media Management System
-- Database Schema
-- Created by: Haziq Omar - IT Department

USE chung_hua_media;

-- Users table (Admin creates accounts)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

-- Invite codes table (Admin generates invite codes)
CREATE TABLE IF NOT EXISTS invite_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_by INT NOT NULL,
    used_by INT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_code (code),
    INDEX idx_expires (expires_at)
);

-- Events table (categorization by event name)
CREATE TABLE IF NOT EXISTS events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_date (event_date),
    INDEX idx_name (name)
);

-- Media table (photos and videos)
CREATE TABLE IF NOT EXISTS media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500),
    file_type ENUM('image', 'video') NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    width INT,
    height INT,
    duration INT, -- for videos in seconds
    event_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    upload_date DATE NOT NULL,
    taken_date DATE,
    year INT GENERATED ALWAYS AS (YEAR(upload_date)) STORED,
    month INT GENERATED ALWAYS AS (MONTH(upload_date)) STORED,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_upload_date (upload_date),
    INDEX idx_year (year),
    INDEX idx_month (month),
    INDEX idx_file_type (file_type),
    INDEX idx_is_approved (is_approved)
);

-- Media tags table (tagging people in photos/videos)
CREATE TABLE IF NOT EXISTS media_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    tagged_user_id INT NOT NULL,
    tagged_by INT NOT NULL,
    position_x DECIMAL(5,2), -- percentage position for photo tagging
    position_y DECIMAL(5,2), -- percentage position for photo tagging
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (tagged_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tagged_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_media_user_tag (media_id, tagged_user_id),
    INDEX idx_media_id (media_id),
    INDEX idx_tagged_user (tagged_user_id)
);

-- Media likes table
CREATE TABLE IF NOT EXISTS media_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_media_user_like (media_id, user_id),
    INDEX idx_media_id (media_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_media_id (media_id),
    INDEX idx_created_at (created_at)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert default admin user
INSERT IGNORE INTO users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@chunghwa.edu.my', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin');

-- Create views for better data retrieval
CREATE OR REPLACE VIEW media_with_details AS
SELECT 
    m.*,
    e.name as event_name,
    e.event_date,
    u.full_name as uploaded_by_name,
    u.username as uploaded_by_username,
    COUNT(DISTINCT mt.id) as tag_count,
    COUNT(DISTINCT ml.id) as like_count,
    COUNT(DISTINCT c.id) as comment_count
FROM media m
LEFT JOIN events e ON m.event_id = e.id
LEFT JOIN users u ON m.uploaded_by = u.id
LEFT JOIN media_tags mt ON m.id = mt.media_id
LEFT JOIN media_likes ml ON m.id = ml.media_id
LEFT JOIN comments c ON m.id = c.media_id AND c.is_approved = TRUE
GROUP BY m.id;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.username,
    u.full_name,
    COUNT(DISTINCT m.id) as total_uploads,
    COUNT(DISTINCT mt.id) as total_tags,
    COUNT(DISTINCT ml.id) as total_likes_given,
    u.created_at
FROM users u
LEFT JOIN media m ON u.id = m.uploaded_by
LEFT JOIN media_tags mt ON u.id = mt.tagged_user_id
LEFT JOIN media_likes ml ON u.id = ml.user_id
WHERE u.is_active = TRUE
GROUP BY u.id; 