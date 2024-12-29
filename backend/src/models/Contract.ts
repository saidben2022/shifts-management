import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Worker } from "./Worker";

@Entity("contracts")
export class Contract {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    workerId: number;

    @Column({ type: "date" })
    startDate: Date;

    @Column()
    duration: number;

    @Column({ type: "date" })
    endDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Worker, worker => worker.contracts)
    @JoinColumn({ name: "workerId" })
    worker: Worker;
}
