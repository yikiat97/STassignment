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
 `email` varchar(100) ,
 `accountStatus` varchar(30) NOT NULL,
 `createDate` int NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
INSERT INTO `accounts` (`id`, `username`, `password`, `email`,`accountStatus`,`createDate`) 
VALUES (1, 'yikiat1', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'active', 123);
INSERT INTO `accounts` (`id`, `username`, `password`, `email`,`accountStatus`,`createDate`) 
VALUES (2, 'yikiat2', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'active', 123);
ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);
ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `accounts` ADD UNIQUE (`username`);


-- Create the user_group table
DROP TABLE IF EXISTS `user_group`;
CREATE TABLE IF NOT EXISTS `user_group` (
    `username` varchar(50) NOT NULL,
    `usergroup` varchar(50) NOT NULL,
    `createDate` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `user_group` ( `username`, `usergroup`, `createDate`) 
VALUES ('yikiat1', 'users',123);
INSERT INTO `user_group` ( `username`, `usergroup`, `createDate`) 
VALUES ('yikiat2', 'admin',123);


-- Select all data from the accounts table
SELECT * FROM accounts;
