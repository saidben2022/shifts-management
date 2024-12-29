import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameWorkerTable1703864000002 implements MigrationInterface {
    name = 'RenameWorkerTable1703864000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop the foreign key constraint in shifts table
        await queryRunner.query(`DROP TABLE IF EXISTS "shifts"`);

        // Rename the worker table to workers
        await queryRunner.query(`ALTER TABLE "worker" RENAME TO "workers"`);

        // Recreate the shifts table with the correct foreign key
        await queryRunner.query(`
            CREATE TABLE "shifts" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "shiftType" varchar NOT NULL DEFAULT ('NORMAL_WORKDAY'),
                "startTime" datetime NOT NULL,
                "endTime" datetime NOT NULL,
                "hoursWorked" float NOT NULL DEFAULT (0),
                "workerId" integer,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "FK_shifts_worker" FOREIGN KEY ("workerId") REFERENCES "workers" ("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the shifts table
        await queryRunner.query(`DROP TABLE "shifts"`);

        // Rename back to worker
        await queryRunner.query(`ALTER TABLE "workers" RENAME TO "worker"`);

        // Recreate the shifts table with the old foreign key
        await queryRunner.query(`
            CREATE TABLE "shifts" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "shiftType" varchar NOT NULL DEFAULT ('NORMAL_WORKDAY'),
                "startTime" datetime NOT NULL,
                "endTime" datetime NOT NULL,
                "hoursWorked" float NOT NULL DEFAULT (0),
                "workerId" integer,
                "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
                "updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
                CONSTRAINT "FK_shifts_worker" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE
            )
        `);
    }
}
