import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Worker } from './Worker';

export enum ShiftType {
  NORMAL_WORKDAY = 'NORMAL_WORKDAY',
  WEEKEND_DAY = 'WEEKEND_DAY',
  HOLIDAY = 'HOLIDAY',
  SICK_LEAVE = 'SICK_LEAVE',
  VACATION = 'VACATION',
  UNPAID_LEAVE = 'UNPAID_LEAVE'
}

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Worker, { onDelete: 'CASCADE' })
  worker!: Worker;

  @Column({
    type: 'varchar',
    enum: ShiftType,
    default: ShiftType.NORMAL_WORKDAY
  })
  shiftType!: ShiftType;

  @Column({ type: 'datetime' })
  startTime!: Date;

  @Column({ type: 'datetime' })
  endTime!: Date;

  @Column({ type: 'float', default: 0 })
  hoursWorked!: number;

  @Column({ type: 'varchar', nullable: true })
  location!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
