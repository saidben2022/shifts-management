import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContractsTable1733864000000 implements MigrationInterface {
    name = 'CreateContractsTable1733864000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, create the new contracts table
        await queryRunner.query(`
            CREATE TABLE "contracts" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "workerId" integer NOT NULL,
                "startDate" date NOT NULL,
                "duration" integer NOT NULL,
                "endDate" date NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                CONSTRAINT "FK_contracts_worker" FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        // Copy existing contract data to the new table
        await queryRunner.query(`
            INSERT INTO "contracts" (workerId, startDate, duration, endDate)
            SELECT id, contractStartDate, contractDuration, contractEndDate
            FROM "worker"
        `);

        // Create a temporary table for worker without contract columns
        await queryRunner.query(`
            CREATE TABLE "temporary_worker" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "firstName" varchar NOT NULL,
                "lastName" varchar NOT NULL,
                "workerId" varchar NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                CONSTRAINT "UQ_3005b853024f8be7da25fb8c135" UNIQUE ("workerId")
            )
        `);

        // Copy data to the temporary table
        await queryRunner.query(`
            INSERT INTO "temporary_worker" (id, firstName, lastName, workerId, createdAt, updatedAt)
            SELECT id, firstName, lastName, workerId, createdAt, updatedAt
            FROM "worker"
        `);

        // Drop the old table
        await queryRunner.query(`DROP TABLE "worker"`);

        // Rename temporary table to worker
        await queryRunner.query(`ALTER TABLE "temporary_worker" RENAME TO "worker"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create temporary table with contract columns
        await queryRunner.query(`
            CREATE TABLE "temporary_worker" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "firstName" varchar NOT NULL,
                "lastName" varchar NOT NULL,
                "workerId" varchar NOT NULL,
                "contractStartDate" date NOT NULL,
                "contractDuration" integer NOT NULL,
                "contractEndDate" date NOT NULL,
                "createdAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                "updatedAt" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP),
                CONSTRAINT "UQ_3005b853024f8be7da25fb8c135" UNIQUE ("workerId")
            )
        `);

        // Get the latest contract for each worker
        await queryRunner.query(`
            INSERT INTO "temporary_worker" (id, firstName, lastName, workerId, contractStartDate, contractDuration, contractEndDate, createdAt, updatedAt)
            SELECT w.id, w.firstName, w.lastName, w.workerId, c.startDate, c.duration, c.endDate, w.createdAt, w.updatedAt
            FROM "worker" w
            LEFT JOIN "contracts" c ON w.id = c.workerId
            WHERE c.id IN (
                SELECT MAX(id)
                FROM "contracts"
                GROUP BY workerId
            )
        `);

        // Drop the contracts table
        await queryRunner.query(`DROP TABLE "contracts"`);

        // Drop the old worker table
        await queryRunner.query(`DROP TABLE "worker"`);

        // Rename temporary table to worker
        await queryRunner.query(`ALTER TABLE "temporary_worker" RENAME TO "worker"`);
    }
}
