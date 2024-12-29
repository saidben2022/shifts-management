import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateWorkerTable1706534000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "worker",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "firstName",
                        type: "varchar",
                    },
                    {
                        name: "lastName",
                        type: "varchar",
                    },
                    {
                        name: "workerId",
                        type: "varchar",
                        isUnique: true
                    },
                    {
                        name: "contractStartDate",
                        type: "date"
                    },
                    {
                        name: "contractDuration",
                        type: "integer"
                    },
                    {
                        name: "contractEndDate",
                        type: "date"
                    },
                    {
                        name: "createdAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updatedAt",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP"
                    }
                ]
            }),
            true
        );

        await queryRunner.createIndex(
            "worker",
            new TableIndex({
                name: "IDX_WORKER_ID",
                columnNames: ["workerId"]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("worker", "IDX_WORKER_ID");
        await queryRunner.dropTable("worker");
    }
}
