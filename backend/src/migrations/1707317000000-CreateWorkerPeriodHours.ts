import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateWorkerPeriodHours1707317000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "worker_period_hours",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "workerId",
                        type: "integer",
                        isNullable: false,
                    },
                    {
                        name: "periodStart",
                        type: "datetime",
                        isNullable: false,
                    },
                    {
                        name: "periodEnd",
                        type: "datetime",
                        isNullable: false,
                    },
                    {
                        name: "maxHours",
                        type: "integer",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            "worker_period_hours",
            new TableForeignKey({
                columnNames: ["workerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "worker",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createIndex(
            "worker_period_hours",
            new TableIndex({
                name: "worker_period_hours_workerId_periodStart_unique",
                columnNames: ["workerId", "periodStart"],
                isUnique: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("worker_period_hours");
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("workerId") !== -1
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey("worker_period_hours", foreignKey);
            }
            const index = table.indices.find(
                (index) => index.name === "worker_period_hours_workerId_periodStart_unique"
            );
            if (index) {
                await queryRunner.dropIndex("worker_period_hours", index);
            }
        }
        await queryRunner.dropTable("worker_period_hours");
    }
}
