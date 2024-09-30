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
VALUES ('admin', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'admin@hotmail.com', 'Active');
INSERT INTO `accounts` (`username`, `password`, `email`,`accountStatus`) 
VALUES ('yikiat1', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'Active');
INSERT INTO `accounts` (`username`, `password`, `email`,`accountStatus`) 
VALUES ('yikiat2', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'Active');
INSERT INTO `accounts` (`username`, `password`, `email`,`accountStatus`)
VALUES ('yikiat3', '$2b$10$QHWQvUhmxoCTqsLivcuE.OcE227AEG03Eb70lOeeNlnCxdvb4KDxe', 'yikiat@hotmail.com', 'Active');
ALTER TABLE `accounts` ADD PRIMARY KEY (`username`);
ALTER TABLE `accounts` ADD UNIQUE (`username`);


-- Create the user_group table
DROP TABLE IF EXISTS `user_group`;
CREATE TABLE IF NOT EXISTS `user_group` (
    `username` varchar(50),
    `usergroup` varchar(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
INSERT INTO `user_group` ( `username`, `usergroup`) 
VALUES ('admin', 'admin');
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





------------------------------------  Assignment 2 ----------------------------------------------




-- Use the newly created database
USE `nodelogin`;


-- Add the Application table (as mentioned in your schema description)
DROP TABLE IF EXISTS `task`;
DROP TABLE IF EXISTS `plan`;
DROP TABLE IF EXISTS `application`;
CREATE TABLE IF NOT EXISTS `application` (
  App_Acronym VARCHAR(50) PRIMARY KEY NOT NULL,
  App_Description TEXT,
  App_Rnumber INT NOT NULL,
  App_startDate INT NOT NULL,
  App_endDate INT NOT NULL,
  App_permit_Open VARCHAR(50),
  App_permit_toDoList VARCHAR(50),
  App_permit_Doing VARCHAR(50),
  App_permit_Done VARCHAR(50),
  App_permit_create VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `plan` (
  Plan_MVP_name VARCHAR(100) NOT NULL,        -- Part of composite primary key
  Plan_app_Acronym VARCHAR(50) NOT NULL,      -- Part of composite primary key and foreign key to application
  Plan_startDate INT NOT NULL,                -- Start date (consider using DATE type instead of INT)
  Plan_endDate INT NOT NULL,                  -- End date (consider using DATE type instead of INT)
  Plan_color VARCHAR(7),                      -- Optional color field
  PRIMARY KEY (Plan_MVP_name, Plan_app_Acronym),  -- Composite primary key
  FOREIGN KEY (Plan_app_Acronym) REFERENCES application(App_Acronym) 
    ON DELETE CASCADE                         -- If an application is deleted, delete the associated plan(s) too
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




CREATE TABLE IF NOT EXISTS `task` (
  Task_id VARCHAR(100) PRIMARY KEY NOT NULL,        -- Primary key
  Task_plan VARCHAR(100),                           -- Foreign key to Plan_MVP_name, can be NULL
  Task_app_Acronym VARCHAR(50) NOT NULL,            -- Foreign key to application
  Task_name VARCHAR(255) NOT NULL,                  -- Task name
  Task_description TEXT,                    -- Task description
  Task_notes MEDIUMTEXT,                            -- Task notes
  Task_state VARCHAR(10),                           -- Task state (e.g., ToDo, InProgress, Done)
  Task_creator VARCHAR(50),                         -- Task creator
  Task_owner VARCHAR(50),                           -- Task owner
  Task_createDate INT,                             -- Task creation date (use DATE for dates)
  FOREIGN KEY (Task_plan) REFERENCES plan(Plan_MVP_name) 
    ON DELETE SET NULL,                             -- If plan is deleted, set Task_plan to NULL
  FOREIGN KEY (Task_app_Acronym) REFERENCES application(App_Acronym) 
    ON DELETE CASCADE                               -- If an application is deleted, delete tasks too
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



-- Example insert for the application table using JSON arrays
INSERT INTO `application` 
(App_Acronym, App_Description, App_Rnumber, App_startDate, App_endDate, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done, App_permit_create) 
VALUES 
('TMS1', 'Task Management System1', 1, '20240101', '20241231', 'admin', 'DEV_forTMS1', 'DEV_forTMS1', 'PL_forTMS1', 'PL_forTMS1');





SELECT * from plan


-- SELECT a.* FROM application a
-- JOIN user_group ug ON JSON_CONTAINS(a.App_permit_Open, JSON_QUOTE(ug.usergroup)) 
--                  OR JSON_CONTAINS(a.App_permit_toDoList, JSON_QUOTE(ug.usergroup))
--                  OR JSON_CONTAINS(a.App_permit_Doing, JSON_QUOTE(ug.usergroup))
--                  OR JSON_CONTAINS(a.App_permit_Done, JSON_QUOTE(ug.usergroup))
--                  OR JSON_CONTAINS(a.App_permit_create, JSON_QUOTE(ug.usergroup))
-- WHERE ug.username = 'yikiat2';  -- Change 'admin' to the desired username