-- Drop the database if it exists
DROP DATABASE IF EXISTS `nodelogin`;

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

-- Use the newly created database
USE `nodelogin`;

-- Create the accounts table
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE IF NOT EXISTS `accounts` (
 `id` int(11) NOT NULL,
 `username` varchar(50) NOT NULL,
 `password` varchar(255) NOT NULL,
 `email` varchar(100) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
INSERT INTO `accounts` (`id`, `username`, `password`, `email`) 
VALUES (1, 'yikiat', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com');
ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `accounts` ADD UNIQUE (`username`);


-- Create the user_group table
DROP TABLE IF EXISTS `user_group`;
CREATE TABLE IF NOT EXISTS `user_group` (
    `id` int(11) NOT NULL,
    `username` varchar(50) NOT NULL,
    `usergroup` varchar(50) NOT NULL,
    CONSTRAINT `fk_username` FOREIGN KEY (`username`) REFERENCES `accounts` (`username`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `user_group` (`id`, `username`, `usergroup`) 
VALUES (1, 'yikiat', 'admin');
ALTER TABLE `user_group` ADD PRIMARY KEY (`id`);
ALTER TABLE `user_group` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

-- Select all data from the accounts table
SELECT * FROM accounts;
