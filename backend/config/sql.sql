-- Drop the database if it exists
DROP DATABASE IF EXISTS `nodelogin`;

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

-- Use the newly created database
USE `nodelogin`;

-- Create the accounts table
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE IF NOT EXISTS `accounts` (
 `username` varchar(50) NOT NULL,
 `password` varchar(255) NOT NULL,
 `email` varchar(100) ,
 `accountStatus` varchar(30) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
INSERT INTO `accounts` (`username`, `password`, `email`,`accountStatus`) 
VALUES ('yikiat1', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'active');
INSERT INTO `accounts` (`username`, `password`, `email`,`accountStatus`) 
VALUES ('yikiat2', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'active');
INSERT INTO `accounts` (`username`, `password`, `email`,`accountStatus`)
VALUES ('yikiat3', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'active');
ALTER TABLE `accounts` ADD PRIMARY KEY (`username`);
ALTER TABLE `accounts` ADD UNIQUE (`username`);


-- Create the user_group table
DROP TABLE IF EXISTS `user_group`;
CREATE TABLE IF NOT EXISTS `user_group` (
    `username` varchar(50),
    `usergroup` varchar(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `user_group` ( `username`, `usergroup`) 
VALUES ('yikiat1', 'users');
INSERT INTO `user_group` ( `username`, `usergroup`) 
VALUES ('yikiat2', 'admin');
INSERT INTO `user_group` ( `username`, `usergroup`) 
VALUES ('yikiat3', 'admin');
INSERT INTO `user_group` ( `username`, `usergroup`) 
VALUES ('yikiat3', 'users');


-- Select all data from the accounts table
SELECT * FROM accounts;
select * from user_group;

SELECT DISTINCT usergroup FROM user_group