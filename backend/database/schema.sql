-- =========================================
-- DATABASE : CHAT APPLICATION
-- =========================================

CREATE DATABASE IF NOT EXISTS chat_app;
USE chat_app;

-- =========================================
-- USERS (AUTH + FACE ID)
-- =========================================
CREATE TABLE users (
    id_users INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    telephone VARCHAR(20) UNIQUE NOT NULL,

    avatar VARCHAR(255),

    google_id VARCHAR(255),

    -- Face ID (vector facial)
    face_descriptor TEXT,

    -- Sécurité Face ID
    face_verified BOOLEAN DEFAULT FALSE,
    face_liveness_score INT DEFAULT 0,

    is_online BOOLEAN DEFAULT FALSE,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- GROUPS
-- =========================================
CREATE TABLE chat_groups (
    id_groups INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    description TEXT,

    created_by INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id_users)
);

-- =========================================
-- GROUP MEMBERS
-- =========================================
CREATE TABLE group_members (
    id_group_members INT AUTO_INCREMENT PRIMARY KEY,

    group_id INT NOT NULL,
    user_id INT NOT NULL,

    role ENUM('admin','member') DEFAULT 'member',

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES chat_groups(id_groups),
    FOREIGN KEY (user_id) REFERENCES users(id_users)
);

-- =========================================
-- MESSAGES (CHAT PRIVÉ + GROUPES)
-- =========================================
CREATE TABLE messages (
    id_messages INT AUTO_INCREMENT PRIMARY KEY,

    sender_id INT NOT NULL,
    receiver_id INT DEFAULT NULL,
    group_id INT DEFAULT NULL,

    message TEXT NOT NULL,
    message_type ENUM('text','image','file','system') DEFAULT 'text',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sender_id) REFERENCES users(id_users),
    FOREIGN KEY (receiver_id) REFERENCES users(id_users),
    FOREIGN KEY (group_id) REFERENCES chat_groups(id_groups)
);

-- =========================================
-- ATTACHMENTS (FICHIERS CHAT)
-- =========================================
CREATE TABLE attachments (
    id_attachments INT AUTO_INCREMENT PRIMARY KEY,

    message_id INT NOT NULL,

    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (message_id) REFERENCES messages(id_messages)
);

-- =========================================
-- AI CHAT HISTORY
-- =========================================
CREATE TABLE ai_messages (
    id_ai_messages INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    question TEXT NOT NULL,
    answer TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id_users)
);

-- =========================================
-- NOTIFICATIONS
-- =========================================
CREATE TABLE notifications (
    id_notifications INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    type ENUM(
        'message',
        'group',
        'ai',
        'security',
        'system'
    ) NOT NULL,

    content TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id_users)
);