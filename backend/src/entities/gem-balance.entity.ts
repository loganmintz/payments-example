import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('gem_balances')
export class GemBalance {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 42, unique: true })
  walletAddress!: string;

  @Column('decimal', { precision: 36, scale: 0 })
  gemBalance!: string;

  @Column('decimal', { precision: 36, scale: 18 })
  ronBalance!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 