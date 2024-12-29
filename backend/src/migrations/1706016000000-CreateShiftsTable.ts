import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateShiftsTable1706016000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "shifts",
                columns: [
                    {
                        name: "id",
                        type: "integer",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "workerId",
                        type: "integer"
                    },
                    {
                        name: "shiftType",
                        type: "varchar"
                    },
                    {
                        name: "date",
                        type: "datetime"
                    },
                    {
                        name: "startTime",
                        type: "datetime"
                    },
                    {
                        name: "endTime",
                        type: "datetime"
                    },
                    {
                        name: "hoursWorked",
                        type: "float"
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
            })
        );

        await queryRunner.createForeignKey(
            "shifts",
            new TableForeignKey({
                columnNames: ["workerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "worker",
                onDelete: "CASCADE"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("shifts");
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("workerId") !== -1);
            if (foreignKey) {
                await queryRunner.dropForeignKey("shifts", foreignKey);
            }
        }
        await queryRunner.dropTable("shifts");
    }
}
