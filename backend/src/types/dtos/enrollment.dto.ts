import { IsEnum, IsUUID, IsOptional, IsNumber, Min, Max, IsDateString } from 'class-validator';

/**
 * Enrollment Status Enum
 * Must match database enum values exactly
 */
export enum EnrollmentStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended'
}

/**
 * DTO for creating a new enrollment
 */
export class CreateEnrollmentDTO {
  @IsUUID()
  user_id!: string;

  @IsUUID()
  course_id!: string;

  @IsOptional()
  @IsEnum(EnrollmentStatusEnum, {
    message: 'Status must be one of: pending, active, completed, cancelled, suspended'
  })
  status?: EnrollmentStatusEnum;
}

/**
 * DTO for updating enrollment status
 */
export class UpdateEnrollmentStatusDTO {
  @IsEnum(EnrollmentStatusEnum, {
    message: 'Status must be one of: pending, active, completed, cancelled, suspended'
  })
  status!: EnrollmentStatusEnum;
}

/**
 * DTO for updating enrollment progress
 */
export class UpdateEnrollmentProgressDTO {
  @IsNumber()
  @Min(0)
  @Max(100)
  progress!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grade?: number;

  @IsOptional()
  @IsDateString()
  completion_date?: string;
}

/**
 * DTO for enrollment response
 */
export interface EnrollmentResponseDTO {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatusEnum;
  enrolled_at: Date;
  progress: number;
  grade?: number;
  completion_date?: Date;
  created_at: Date;
  updated_at: Date;
}
