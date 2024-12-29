import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import * as bcrypt from "bcrypt";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;

    @Column({ default: false })
    isAdmin!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    private tempPassword?: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password && (this.tempPassword !== this.password)) {
            this.password = await bcrypt.hash(this.password, 10);
            this.tempPassword = this.password;
        }
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}
