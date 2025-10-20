// User type definitions for type safety
export interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified: boolean;
  email_verified_at?: Date;
  token_version: number;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;

  // ===== STUDENT FIELDS =====
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;

  // ===== INSTRUCTOR FIELDS =====
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;

  // ===== COMMON FIELDS =====
  date_of_birth?: string; // DATEONLY as string
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface UserCreationAttributes {
  id?: string;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role?: 'student' | 'instructor' | 'admin' | 'super_admin';
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified?: boolean;
  email_verified_at?: Date;
  token_version?: number;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;

  // ===== STUDENT FIELDS =====
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;

  // ===== INSTRUCTOR FIELDS =====
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;

  // ===== COMMON FIELDS =====
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

export interface UserPublicProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email_verified: boolean;
  created_at: Date;

  // ===== STUDENT FIELDS =====
  student_id?: string;
  class?: string;
  major?: string;
  year?: number;
  gpa?: number;

  // ===== INSTRUCTOR FIELDS =====
  instructor_id?: string;
  department?: string;
  specialization?: string;
  experience_years?: number;
  education_level?: 'bachelor' | 'master' | 'phd' | 'professor';
  research_interests?: string;

  // ===== COMMON FIELDS =====
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

// Extended User interface with instance methods
export interface UserInstance extends UserAttributes {
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
  getPublicProfile(): UserPublicProfile;
  hasRole(role: string | string[]): boolean;
  isInstructor(): boolean;
  isAdmin(): boolean;
  isStudent(): boolean;
}

// Alias to align tests and repositories using different UserInstance
export type SequelizeUserInstance = import('./model.types').UserInstance;

// User role enum
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// User status enum
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

