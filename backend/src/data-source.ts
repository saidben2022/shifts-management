import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Worker } from "./entities/Worker";
import { Shift } from "./entities/Shift";
import { Contract } from "./entities/Contract";
import { WorkerPeriodHours } from "./entities/WorkerPeriodHours";
import { CreateUserTable1706015000000 } from "./migrations/1706015000000-CreateUserTable";
import { CreateShiftsTable1706016000000 } from "./migrations/1706016000000-CreateShiftsTable";
import { CreateWorkerTable1706534000000 } from "./migrations/1706534000000-CreateWorkerTable";
import { CreateWorkerPeriodHours1707317000000 } from "./migrations/1707317000000-CreateWorkerPeriodHours";
import { UpdateShiftDateColumns1703864000000 } from "./migrations/1703864000000-UpdateShiftDateColumns";
import { UpdateShiftTimestamps1703864000001 } from "./migrations/1703864000001-UpdateShiftTimestamps";
import { RenameWorkerTable1703864000002 } from "./migrations/1703864000002-RenameWorkerTable";
import { AddLocationToShift1703864200000 } from "./migrations/1703864200000-AddLocationToShift";
import path from "path";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: path.join(__dirname, "..", "database.sqlite"),
    synchronize: false,
    logging: true,
    entities: [User, Worker, Shift, Contract, WorkerPeriodHours],
    migrations: [
        CreateUserTable1706015000000,
        CreateShiftsTable1706016000000,
        CreateWorkerTable1706534000000,
        CreateWorkerPeriodHours1707317000000,
        UpdateShiftDateColumns1703864000000,
        UpdateShiftTimestamps1703864000001,
        RenameWorkerTable1703864000002,
        AddLocationToShift1703864200000
    ],
    subscribers: [],
});
