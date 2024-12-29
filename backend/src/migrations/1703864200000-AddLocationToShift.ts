import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationToShift1703864200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "temporary_shifts" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "workerId" integer,
                "shiftType" varchar CHECK( "shiftType" IN ('NORMAL_WORKDAY','WEEKEND_DAY','HOLIDAY','SICK_LEAVE','VACATION','UNPAID_LEAVE') ) NOT NULL DEFAULT ('NORMAL_WORKDAY'),
                "startTime" datetime NOT NULL,
                "endTime" datetime NOT NULL,
                "hoursWorked" float NOT NULL DEFAULT (0),
                "location" varchar,
                "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                CONSTRAINT "FK_shifts_worker" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            INSERT INTO "temporary_shifts" ("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt")
            SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt"
            FROM "shifts"
        `);

        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "temporary_shifts" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "workerId" integer,
                "shiftType" varchar CHECK( "shiftType" IN ('NORMAL_WORKDAY','WEEKEND_DAY','HOLIDAY','SICK_LEAVE','VACATION','UNPAID_LEAVE') ) NOT NULL DEFAULT ('NORMAL_WORKDAY'),
                "startTime" datetime NOT NULL,
                "endTime" datetime NOT NULL,
                "hoursWorked" float NOT NULL DEFAULT (0),
                "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                CONSTRAINT "FK_shifts_worker" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            INSERT INTO "temporary_shifts" ("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt")
            SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt"
            FROM "shifts"
        `);

        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
    }
}
