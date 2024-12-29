import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateShiftEntity1733170957693 implements MigrationInterface {
    name = 'UpdateShiftEntity1733170957693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "worker_period_hours_workerId_periodStart_unique"`);
        await queryRunner.query(`CREATE TABLE "temporary_worker_period_hours" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "periodStart" datetime NOT NULL, "periodEnd" datetime NOT NULL, "maxHours" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "temporary_worker_period_hours"("id", "workerId", "periodStart", "periodEnd", "maxHours") SELECT "id", "workerId", "periodStart", "periodEnd", "maxHours" FROM "worker_period_hours"`);
        await queryRunner.query(`DROP TABLE "worker_period_hours"`);
        await queryRunner.query(`ALTER TABLE "temporary_worker_period_hours" RENAME TO "worker_period_hours"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "worker_period_hours_workerId_periodStart_unique" ON "worker_period_hours" ("workerId", "periodStart") `);
        await queryRunner.query(`DROP INDEX "IDX_WORKER_ID"`);
        await queryRunner.query(`DROP INDEX "worker_period_hours_workerId_periodStart_unique"`);
        await queryRunner.query(`CREATE TABLE "temporary_shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "shiftType" varchar NOT NULL, "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_e9992e51b7374929060284ed5df" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "shifts"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
        await queryRunner.query(`CREATE TABLE "temporary_user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "isAdmin" boolean NOT NULL DEFAULT (0), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "temporary_user"("id", "username", "password", "isAdmin", "createdAt", "updatedAt") SELECT "id", "username", "password", "isAdmin", "createdAt", "updatedAt" FROM "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`ALTER TABLE "temporary_user" RENAME TO "user"`);
        await queryRunner.query(`CREATE TABLE "temporary_shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "shiftType" varchar NOT NULL, "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`INSERT INTO "temporary_shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "shifts"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
        await queryRunner.query(`CREATE TABLE "temporary_shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer, "shiftType" varchar CHECK( "shiftType" IN ('NORMAL_WORKDAY','WEEKEND_DAY','HOLIDAY','SICK_LEAVE','VACATION','UNPAID_LEAVE') ) NOT NULL DEFAULT ('NORMAL_WORKDAY'), "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`INSERT INTO "temporary_shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "shifts"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
        await queryRunner.query(`CREATE TABLE "temporary_worker" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "workerId" varchar NOT NULL, "contractStartDate" date NOT NULL, "contractDuration" integer NOT NULL, "contractEndDate" date NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_3005b853024f8be7da25fb8c135" UNIQUE ("workerId"))`);
        await queryRunner.query(`INSERT INTO "temporary_worker"("id", "firstName", "lastName", "workerId", "contractStartDate", "contractDuration", "contractEndDate", "createdAt", "updatedAt") SELECT "id", "firstName", "lastName", "workerId", "contractStartDate", "contractDuration", "contractEndDate", "createdAt", "updatedAt" FROM "worker"`);
        await queryRunner.query(`DROP TABLE "worker"`);
        await queryRunner.query(`ALTER TABLE "temporary_worker" RENAME TO "worker"`);
        await queryRunner.query(`CREATE TABLE "temporary_shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer, "shiftType" varchar CHECK( "shiftType" IN ('NORMAL_WORKDAY','WEEKEND_DAY','HOLIDAY','SICK_LEAVE','VACATION','UNPAID_LEAVE') ) NOT NULL DEFAULT ('NORMAL_WORKDAY'), "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_e9992e51b7374929060284ed5df" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "shifts"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`ALTER TABLE "temporary_shifts" RENAME TO "shifts"`);
        await queryRunner.query(`CREATE TABLE "temporary_worker_period_hours" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "periodStart" datetime NOT NULL, "periodEnd" datetime NOT NULL, "maxHours" integer NOT NULL, CONSTRAINT "FK_7709c9d31f19f4cd10fea53b41b" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_worker_period_hours"("id", "workerId", "periodStart", "periodEnd", "maxHours") SELECT "id", "workerId", "periodStart", "periodEnd", "maxHours" FROM "worker_period_hours"`);
        await queryRunner.query(`DROP TABLE "worker_period_hours"`);
        await queryRunner.query(`ALTER TABLE "temporary_worker_period_hours" RENAME TO "worker_period_hours"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "worker_period_hours" RENAME TO "temporary_worker_period_hours"`);
        await queryRunner.query(`CREATE TABLE "worker_period_hours" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "periodStart" datetime NOT NULL, "periodEnd" datetime NOT NULL, "maxHours" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "worker_period_hours"("id", "workerId", "periodStart", "periodEnd", "maxHours") SELECT "id", "workerId", "periodStart", "periodEnd", "maxHours" FROM "temporary_worker_period_hours"`);
        await queryRunner.query(`DROP TABLE "temporary_worker_period_hours"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME TO "temporary_shifts"`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer, "shiftType" varchar CHECK( "shiftType" IN ('NORMAL_WORKDAY','WEEKEND_DAY','HOLIDAY','SICK_LEAVE','VACATION','UNPAID_LEAVE') ) NOT NULL DEFAULT ('NORMAL_WORKDAY'), "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`INSERT INTO "shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "temporary_shifts"`);
        await queryRunner.query(`DROP TABLE "temporary_shifts"`);
        await queryRunner.query(`ALTER TABLE "worker" RENAME TO "temporary_worker"`);
        await queryRunner.query(`CREATE TABLE "worker" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "firstName" varchar NOT NULL, "lastName" varchar NOT NULL, "workerId" varchar NOT NULL, "contractStartDate" date NOT NULL, "contractDuration" integer NOT NULL, "contractEndDate" date NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_3005b853024f8be7da25fb8c135" UNIQUE ("workerId"))`);
        await queryRunner.query(`INSERT INTO "worker"("id", "firstName", "lastName", "workerId", "contractStartDate", "contractDuration", "contractEndDate", "createdAt", "updatedAt") SELECT "id", "firstName", "lastName", "workerId", "contractStartDate", "contractDuration", "contractEndDate", "createdAt", "updatedAt" FROM "temporary_worker"`);
        await queryRunner.query(`DROP TABLE "temporary_worker"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME TO "temporary_shifts"`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "shiftType" varchar NOT NULL, "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`INSERT INTO "shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "temporary_shifts"`);
        await queryRunner.query(`DROP TABLE "temporary_shifts"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME TO "temporary_shifts"`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "shiftType" varchar NOT NULL, "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_e9992e51b7374929060284ed5df" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "temporary_shifts"`);
        await queryRunner.query(`DROP TABLE "temporary_shifts"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME TO "temporary_user"`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "password" varchar NOT NULL, "isAdmin" boolean NOT NULL DEFAULT (false), "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"))`);
        await queryRunner.query(`INSERT INTO "user"("id", "username", "password", "isAdmin", "createdAt", "updatedAt") SELECT "id", "username", "password", "isAdmin", "createdAt", "updatedAt" FROM "temporary_user"`);
        await queryRunner.query(`DROP TABLE "temporary_user"`);
        await queryRunner.query(`ALTER TABLE "shifts" RENAME TO "temporary_shifts"`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "shiftType" varchar NOT NULL, "date" datetime NOT NULL, "startTime" datetime NOT NULL, "endTime" datetime NOT NULL, "hoursWorked" float NOT NULL, "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), CONSTRAINT "FK_e9992e51b7374929060284ed5df" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "shifts"("id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt") SELECT "id", "workerId", "shiftType", "startTime", "endTime", "hoursWorked", "createdAt", "updatedAt" FROM "temporary_shifts"`);
        await queryRunner.query(`DROP TABLE "temporary_shifts"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "worker_period_hours_workerId_periodStart_unique" ON "worker_period_hours" ("workerId", "periodStart") `);
        await queryRunner.query(`CREATE INDEX "IDX_WORKER_ID" ON "worker" ("workerId") `);
        await queryRunner.query(`DROP INDEX "worker_period_hours_workerId_periodStart_unique"`);
        await queryRunner.query(`ALTER TABLE "worker_period_hours" RENAME TO "temporary_worker_period_hours"`);
        await queryRunner.query(`CREATE TABLE "worker_period_hours" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "workerId" integer NOT NULL, "periodStart" datetime NOT NULL, "periodEnd" datetime NOT NULL, "maxHours" integer NOT NULL, CONSTRAINT "FK_7709c9d31f19f4cd10fea53b41b" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "worker_period_hours"("id", "workerId", "periodStart", "periodEnd", "maxHours") SELECT "id", "workerId", "periodStart", "periodEnd", "maxHours" FROM "temporary_worker_period_hours"`);
        await queryRunner.query(`DROP TABLE "temporary_worker_period_hours"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "worker_period_hours_workerId_periodStart_unique" ON "worker_period_hours" ("workerId", "periodStart") `);
    }

}
