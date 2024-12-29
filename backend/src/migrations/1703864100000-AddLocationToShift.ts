import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationToShift1703864100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "shifts" ADD COLUMN "location" varchar NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "shifts" DROP COLUMN "location"
        `);
    }
}
