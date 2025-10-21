CREATE TABLE `researchProposals` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`sourcePaperIds` text NOT NULL,
	`openProblems` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `researchProposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `surveyReports` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`proposalId` varchar(64),
	`title` text NOT NULL,
	`content` text NOT NULL,
	`relatedPaperIds` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `surveyReports_id` PRIMARY KEY(`id`)
);
