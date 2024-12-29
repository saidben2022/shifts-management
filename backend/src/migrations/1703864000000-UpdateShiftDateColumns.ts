import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateShiftDateColumns1703864000000 implements MigrationInterface {
    name = 'UpdateShiftDateColumns1703864000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create a new table with the updated schema
        await queryRunner.query(`
            CREATE TABLE "temporary_shifts" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "shiftType" varchar NOT NULL DEFAULT ('NORMAL_WORKDAY'),
                "startTime" datetime NOT NULL,
                "endTime" datetime NOT NULL,
                "hoursWorked" float NOT NULL DEFAULT (0),
                "workerId" integer,
                CONSTRAINT "FK_shifts_worker" FOREIGN KEY ("workerId") REFERENCES "workers" ("id") ON DELETE CASCADE
            )
        `);

        // Copy data from the old table to the new table
        await queryRunner.query(`
            INSERT INTO "temporary_shifts" ("id", "shiftType", "startTime", "endTime", "hoursWorked", "workerId")
            SELECT "id", "shiftType", datetime("startTime"), datetime("endTime"), "hoursWorked", "workerId"
            FROM "shifts"
        `);

        // Drop the old table
        await queryRunner.query(`DROP TABLE "shifts"`);

        // Rename the temporary table to the original name
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // If needed to rollback, convert back to text columns
        await queryRunner.query(`
            CREATE TABLE "temporary_shifts" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "shiftType" varchar NOT NULL DEFAULT ('NORMAL_WORKDAY'),
                "startTime" text NOT NULL,
                "endTime" text NOT NULL,
                "hoursWorked" float NOT NULL DEFAULT (0),
                "workerId" integer,
                CONSTRAINT "FK_shifts_worker" FOREIGN KEY ("workerId") REFERENCES "workers" ("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            INSERT INTO "temporary_shifts" ("id", "shiftType", "startTime", "endTime", "hoursWorked", "workerId")
            SELECT "id", "shiftType", "startTime", "endTime", "hoursWorked", "workerId"
            FROM "shifts"
        `);

        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
    }
}
