import { Op } from 'sequelize';
import { UserActivityLog, User } from '../../models';

type ListFilters = {
  user_id?: string;
  action?: string;
  resource_type?: string;
  status?: 'success' | 'failed';
  date_from?: string;
  date_to?: string;
};

type ExportFilters = {
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
};

function toIsoDateRange(filters: { date_from?: string; date_to?: string }) {
  const where: Record<string, any> = {};
  const from = filters.date_from ? new Date(filters.date_from) : undefined;
  const to = filters.date_to ? new Date(filters.date_to) : undefined;

  if (from && !Number.isNaN(from.getTime()) && to && !Number.isNaN(to.getTime())) {
    where[Op.between] = [from, to];
  } else if (from && !Number.isNaN(from.getTime())) {
    where[Op.gte] = from;
  } else if (to && !Number.isNaN(to.getTime())) {
    where[Op.lte] = to;
  }

  return where;
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function csvEscape(value: unknown): string {
  const s = safeString(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export class ActivityLogsService {
  async list(page: number, limit: number, filters?: ListFilters) {
    const offset = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (filters?.user_id) where.user_id = filters.user_id;

    // Prefer new structured columns, fallback to legacy activity_type
    if (filters?.action) {
      where[Op.or] = [
        { action: filters.action },
        { activity_type: filters.action },
      ];
    }

    if (filters?.resource_type) where.resource_type = filters.resource_type;
    if (filters?.status) where.status = filters.status;

    const createdAt = toIsoDateRange(filters || {});
    if (Object.keys(createdAt).length > 0) where.created_at = createdAt;

    const { rows, count } = await UserActivityLog.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset,
      limit,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false,
        },
      ],
    });

    const data = rows.map((row: any) => {
      const user = row.user;
      const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '';

      return {
        id: row.id,
        user_id: row.user_id,
        user_name: userName,
        action: row.action || row.activity_type,
        resource_type: row.resource_type || 'system',
        resource_id: row.resource_id || '',
        old_values: row.old_values || {},
        new_values: row.new_values || {},
        ip_address: row.ip_address || '',
        user_agent: row.user_agent || '',
        status: (row.status === 'failed' ? 'failed' : 'success') as 'success' | 'failed',
        error_message: row.error_message || undefined,
        created_at: row.createdAt || row.created_at, // Sequelize returns camelCase in JS
      };
    });

    return { data, total: count, page, limit };
  }

  async getById(logId: string) {
    const row: any = await UserActivityLog.findByPk(logId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false,
        },
      ],
    });
    if (!row) return null;
    const user = row.user;
    const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '';

    return {
      id: row.id,
      user_id: row.user_id,
      user_name: userName,
      action: row.action || row.activity_type,
      resource_type: row.resource_type || 'system',
      resource_id: row.resource_id || '',
      old_values: row.old_values || {},
      new_values: row.new_values || {},
      ip_address: row.ip_address || '',
      user_agent: row.user_agent || '',
      status: (row.status === 'failed' ? 'failed' : 'success') as 'success' | 'failed',
      error_message: row.error_message || undefined,
      created_at: row.createdAt || row.created_at, // Sequelize returns camelCase in JS
    };
  }

  async clearOld(olderThanDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const deleted = await UserActivityLog.destroy({
      where: {
        created_at: { [Op.lt]: cutoff },
      },
    });

    return deleted;
  }

  async exportJson(filters?: ExportFilters) {
    const where: Record<string, any> = {};

    if (filters?.action) {
      where[Op.or] = [{ action: filters.action }, { activity_type: filters.action }];
    }
    if (filters?.resource_type) where.resource_type = filters.resource_type;

    const createdAt = toIsoDateRange(filters || {});
    if (Object.keys(createdAt).length > 0) where.created_at = createdAt;

    const rows: any[] = await UserActivityLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: 5000,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false,
        },
      ],
    });

    return rows.map((row: any) => {
      const user = row.user;
      const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : '';
      return {
        id: row.id,
        user_id: row.user_id,
        user_name: userName,
        action: row.action || row.activity_type,
        resource_type: row.resource_type || 'system',
        resource_id: row.resource_id || null,
        old_values: row.old_values || {},
        new_values: row.new_values || {},
        ip_address: row.ip_address || null,
        user_agent: row.user_agent || null,
        status: row.status || 'success',
        error_message: row.error_message || null,
        created_at: row.created_at,
      };
    });
  }

  async exportCsv(filters?: ExportFilters): Promise<string> {
    const rows = await this.exportJson(filters);

    const header = [
      'id',
      'created_at',
      'user_id',
      'user_name',
      'action',
      'resource_type',
      'resource_id',
      'status',
      'ip_address',
      'error_message',
    ];

    const lines = [header.join(',')];

    for (const row of rows) {
      lines.push(
        [
          csvEscape(row.id),
          csvEscape(row.created_at),
          csvEscape(row.user_id),
          csvEscape(row.user_name),
          csvEscape(row.action),
          csvEscape(row.resource_type),
          csvEscape(row.resource_id),
          csvEscape(row.status),
          csvEscape(row.ip_address),
          csvEscape(row.error_message),
        ].join(',')
      );
    }

    return lines.join('\n');
  }
}
