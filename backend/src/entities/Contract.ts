import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Worker } from "./Worker";

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    workerId!: number;

    @Column({ type: 'date' })
    startDate!: Date;

    @Column()
    duration!: number;

    @Column({ type: 'date' })
    endDate!: Date;

    @ManyToOne(() => Worker, worker => worker.contracts)
    worker!: Worker;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
