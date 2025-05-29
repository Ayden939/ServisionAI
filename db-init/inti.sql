CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

CREATE TABLE IF NOT EXISTS users (
  id INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO users (id, username, email, password) VALUES
(1, 'alice', 'alice@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg1'),
(2, 'bob', 'bob@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg2'),
(3, 'charlie', 'charlie@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg3'),
(4, 'diana', 'diana@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg4'),
(5, 'eve', 'eve@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg5'),
(6, 'frank', 'frank@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg6'),
(7, 'grace', 'grace@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg7'),
(8, 'henry', 'henry@example.com', '$2y$10$abcdefg1234567890abcdefg1234567890abcdefg1234567890abcdefg8');


CREATE TABLE IF NOT EXISTS subscriptions (
  id INT(11) NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
  task_id INT(11) NOT NULL AUTO_INCREMENT,
  userid INT(11) DEFAULT NULL,
  point INT(11) NOT NULL,
  info VARCHAR(255) NOT NULL,
  status VARCHAR(255) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (task_id),
  FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO tasks (userid, point, info, status, start, end, location) VALUES
(1, 3, 'fullPlates', 'confirm', '2025-03-22 08:00:00', '2025-03-22 08:02:00', 'left'),
(2, 4, 'emptyPlates', 'dismiss', '2025-03-24 10:15:00', '2025-03-24 10:17:30', 'right'),
(3, 2, 'fullPlates', 'confirm', '2025-03-26 09:00:00', '2025-03-26 09:03:00', 'center'),
(4, 1, 'emptyPlates', 'confirm', '2025-03-28 11:45:00', '2025-03-28 11:47:20', 'left'),
(5, 5, 'fullPlates', 'dismiss', '2025-03-30 13:00:00', '2025-03-30 13:02:15', 'right'),
(7, 3, 'fullPlates', 'confirm', '2025-04-03 14:00:00', '2025-04-03 14:02:10', 'down'),
(8, 2, 'emptyPlates', 'dismiss', '2025-04-05 16:10:00', '2025-04-05 16:12:00', 'left'),
(1, 5, 'fullPlates', 'confirm', '2025-04-07 08:20:00', '2025-04-07 08:22:30', 'right'),
(2, 1, 'emptyPlates', 'confirm', '2025-04-09 10:00:00', '2025-04-09 10:01:45', 'left'),
(3, 4, 'fullPlates', 'confirm', '2025-04-11 12:45:00', '2025-04-11 12:47:30', 'right'),
(4, 3, 'emptyPlates', 'dismiss', '2025-04-13 09:00:00', '2025-04-13 09:01:50', 'center'),
(5, 2, 'fullPlates', 'confirm', '2025-04-14 11:30:00', '2025-04-14 11:32:00', 'left'),
(7, 1, 'emptyPlates', 'confirm', '2025-04-15 13:10:00', '2025-04-15 13:11:45', 'right'),
(8, 5, 'fullPlates', 'dismiss', '2025-04-16 15:15:00', '2025-04-16 15:17:20', 'left'),
(1, 3, 'emptyPlates', 'confirm', '2025-04-17 17:00:00', '2025-04-17 17:01:30', 'right'),
(2, 2, 'fullBottles', 'confirm', '2025-04-18 09:10:00', '2025-04-18 09:11:20', 'center'),
(3, 4, 'emptyBottles', 'dismiss', '2025-04-19 08:20:00', '2025-04-19 08:22:00', 'left'),
(4, 1, 'fullBottles', 'confirm', '2025-04-20 10:00:00', '2025-04-20 10:01:30', 'right'),
(5, 5, 'emptyBottles', 'confirm', '2025-04-21 11:15:00', '2025-04-21 11:17:10', 'down');