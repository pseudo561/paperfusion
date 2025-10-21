CREATE TABLE `favorites` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paperSummaries` (
	`id` varchar(64) NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`summary` text NOT NULL,
	`language` varchar(16) DEFAULT 'en',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `paperSummaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paperTranslations` (
	`id` varchar(64) NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`translatedTitle` text,
	`translatedAbstract` text,
	`targetLanguage` varchar(16) DEFAULT 'ja',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `paperTranslations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `papers` (
	`id` varchar(64) NOT NULL,
	`arxivId` varchar(64),
	`semanticScholarId` varchar(64),
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`abstract` text,
	`categories` text,
	`publishedDate` timestamp,
	`pdfUrl` varchar(512),
	`citationsCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `papers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userHistory` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`viewedAt` timestamp DEFAULT (now()),
	`category` varchar(128),
	CONSTRAINT `userHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRatings` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`rating` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `userRatings_id` PRIMARY KEY(`id`)
);
