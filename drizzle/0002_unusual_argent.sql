CREATE TABLE `operation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`operationType` varchar(50) NOT NULL,
	`deviceVid` varchar(10) NOT NULL,
	`devicePid` varchar(10) NOT NULL,
	`deviceChipset` varchar(50),
	`result` varchar(20) NOT NULL,
	`dryRun` int NOT NULL DEFAULT 0,
	`executionTimeMs` int,
	`errorMessage` text,
	`backupId` varchar(100),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`userId` int,
	CONSTRAINT `operation_history_id` PRIMARY KEY(`id`)
);
