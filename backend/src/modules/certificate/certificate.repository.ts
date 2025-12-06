/**
 * Certificate Repository
 * Data access layer for certificate operations
 */

import { Op } from 'sequelize';
import Certificate from '../../models/certificate.model';
import User from '../../models/user.model';
import Course from '../../models/course.model';
import Enrollment from '../../models/enrollment.model';
import { CertificateWithDetails, CertificateListQuery } from './certificate.types';
import { getSequelize } from '../../config/db';

export class CertificateRepository {
  private sequelize = getSequelize();

  /**
   * Create a new certificate
   */
  async create(data: {
    user_id: string;
    course_id: string;
    enrollment_id?: string;
    ipfs_hash: string;
    certificate_hash: string;
    metadata: any;
    certificate_number: string;
    issued_at: Date;
    status?: string;
  }): Promise<Certificate> {
    return await Certificate.create(data);
  }

  /**
   * Find certificate by ID
   */
  async findById(id: string, includeRelations: boolean = true): Promise<Certificate | null> {
    const include: any[] = [];

    if (includeRelations) {
      include.push(
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        }
      );
    }

    return await Certificate.findByPk(id, { include });
  }

  /**
   * Find certificate by certificate hash
   */
  async findByHash(certificateHash: string): Promise<Certificate | null> {
    return await Certificate.findOne({
      where: { certificate_hash: certificateHash },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });
  }

  /**
   * Find certificate by IPFS hash
   */
  async findByIPFSHash(ipfsHash: string): Promise<Certificate | null> {
    return await Certificate.findOne({
      where: { ipfs_hash: ipfsHash },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });
  }

  /**
   * Find certificate by certificate number
   */
  async findByCertificateNumber(certificateNumber: string): Promise<Certificate | null> {
    return await Certificate.findOne({
      where: { certificate_number: certificateNumber },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        },
      ],
    });
  }

  /**
   * Check if certificate exists for user and course
   */
  async existsForUserAndCourse(userId: string, courseId: string): Promise<boolean> {
    const count = await Certificate.count({
      where: {
        user_id: userId,
        course_id: courseId,
        status: 'active',
      },
    });
    return count > 0;
  }

  /**
   * Find certificates by user ID
   */
  async findByUserId(userId: string, options?: { status?: string; limit?: number; offset?: number }): Promise<Certificate[]> {
    const where: any = { user_id: userId };
    if (options?.status) {
      where.status = options.status;
    }

    return await Certificate.findAll({
      where,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'thumbnail'],
        },
      ],
      order: [['issued_at', 'DESC']],
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * Find certificates by course ID
   */
  async findByCourseId(courseId: string, options?: { status?: string; limit?: number; offset?: number }): Promise<Certificate[]> {
    const where: any = { course_id: courseId };
    if (options?.status) {
      where.status = options.status;
    }

    return await Certificate.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
      ],
      order: [['issued_at', 'DESC']],
      limit: options?.limit,
      offset: options?.offset,
    });
  }

  /**
   * List certificates with pagination and filters
   */
  async list(query: CertificateListQuery): Promise<{ certificates: Certificate[]; total: number }> {
    const where: any = {};
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    if (query.user_id) {
      where.user_id = query.user_id;
    }
    if (query.course_id) {
      where.course_id = query.course_id;
    }
    if (query.status) {
      where.status = query.status;
    }

    const { count, rows } = await Certificate.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description'],
        },
      ],
      order: [['issued_at', 'DESC']],
      limit,
      offset,
    });

    return {
      certificates: rows,
      total: count,
    };
  }

  /**
   * Revoke certificate
   */
  async revoke(id: string, reason?: string): Promise<boolean> {
    const [affectedRows] = await Certificate.update(
      {
        status: 'revoked',
        revoked_at: new Date(),
        revoked_reason: reason,
      },
      {
        where: { id, status: 'active' },
      }
    );

    return affectedRows > 0;
  }

  /**
   * Count certificates by user
   */
  async countByUserId(userId: string, status?: string): Promise<number> {
    const where: any = { user_id: userId };
    if (status) {
      where.status = status;
    }
    return await Certificate.count({ where });
  }
}

