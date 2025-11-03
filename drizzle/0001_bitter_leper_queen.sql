CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`tags` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_paper_unique` UNIQUE(`userId`,`paperId`)
);
--> statement-breakpoint
CREATE TABLE `paperSummaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`summary` text NOT NULL,
	`language` varchar(16) DEFAULT 'en',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `paperSummaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paperTranslations` (
	`id` int AUTO_INCREMENT NOT NULL,
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
CREATE TABLE `researchProposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sourcePaperIds` text NOT NULL,
	`openProblems` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `researchProposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveyReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`proposalId` int,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`relatedPaperIds` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `surveyReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`viewedAt` timestamp DEFAULT (now()),
	`category` varchar(128),
	CONSTRAINT `userHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userRatings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`paperId` varchar(64) NOT NULL,
	`rating` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `userRatings_id` PRIMARY KEY(`id`)
);
