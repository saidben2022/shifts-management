import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Worker } from './Worker';

@Entity('worker_period_hours')
@Index(['workerId', 'periodStart', 'periodEnd'], { unique: true })
export class WorkerPeriodHours {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Worker, { onDelete: 'CASCADE' })
    worker!: Worker;

    @Column()
    workerId!: number;

    @Column({ type: 'datetime' })
    periodStart!: Date;

    @Column({ type: 'datetime' })
    periodEnd!: Date;

    @Column({ type: 'float' })
    maxHours!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
