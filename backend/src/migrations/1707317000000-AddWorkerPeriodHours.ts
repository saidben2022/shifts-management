import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWorkerPeriodHours1707317000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "worker_period_hours" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "workerId" integer NOT NULL,
                "periodStart" datetime NOT NULL,
                "periodEnd" datetime NOT NULL,
                "maxHours" integer NOT NULL,
                FOREIGN KEY ("workerId") REFERENCES "worker" ("id") ON DELETE CASCADE,
                UNIQUE("workerId", "periodStart")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "worker_period_hours"`);
    }
}
