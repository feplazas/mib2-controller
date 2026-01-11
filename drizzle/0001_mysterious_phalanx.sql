CREATE TABLE `command_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`command` text NOT NULL,
	`output` text,
	`error` text,
	`success` int NOT NULL DEFAULT 0,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	`host` varchar(15),
	`port` int,
	`userId` int,
	CONSTRAINT `command_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connection_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host` varchar(15) NOT NULL,
	`port` int NOT NULL,
	`success` int NOT NULL,
	`errorMessage` text,
	`connectedAt` timestamp NOT NULL DEFAULT (now()),
	`disconnectedAt` timestamp,
	`userId` int,
	CONSTRAINT `connection_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predefined_commands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(50) NOT NULL,
	`description` text NOT NULL,
	`command` text NOT NULL,
	`requiresConfirmation` int NOT NULL DEFAULT 0,
	`firmwareVersion` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `predefined_commands_id` PRIMARY KEY(`id`)
);
