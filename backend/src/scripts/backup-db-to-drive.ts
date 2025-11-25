import 'dotenv-flow/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.util';
import { GoogleDriveService } from '../services/storage/google-drive.service';

const execAsync = promisify(exec);

async function createDatabaseDump(): Promise<{ filePath: string; fileName: string }> {
  const dbName = process.env.HOST_POSTGRES_DB || process.env.POSTGRES_DB || 'lms_db';
  const dbUser = process.env.HOST_POSTGRES_USER || process.env.POSTGRES_USER || 'lms_user';
  const dbHost = process.env.HOST_POSTGRES_HOST || process.env.DB_HOST || 'localhost';
  const dbPort = process.env.HOST_POSTGRES_PORT || process.env.DB_PORT || '5432';

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

  const fileName = `backup-${dbName}-${timestamp}.sql`;
  const backupsDir = path.resolve(__dirname, '../../backups');

  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const filePath = path.join(backupsDir, fileName);

  const pgDumpCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -F p -d ${dbName} -f "${filePath}"`;

  logger.info('Running pg_dump for database backup', {
    dbHost,
    dbPort,
    dbName,
    dbUser,
    filePath
  });

  // Lưu ý: cần đặt biến môi trường PGPASSWORD trước khi chạy script
  await execAsync(pgDumpCmd, {
    env: {
      ...process.env,
      PGPASSWORD: process.env.HOST_POSTGRES_PASSWORD || process.env.POSTGRES_PASSWORD || '123456'
    }
  });

  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file was not created at ${filePath}`);
  }

  return { filePath, fileName };
}

async function main() {
  try {
    logger.info('Starting database backup to Google Drive...');

    const { filePath, fileName } = await createDatabaseDump();

    const buffer = await fs.promises.readFile(filePath);

    const driveService = new GoogleDriveService();
    await driveService.uploadBackup(buffer, fileName, 'application/sql');

    // Xoá backup local sau khi upload thành công
    await fs.promises.unlink(filePath);

    // Xoá các backup cũ hơn 30 ngày trên Drive
    const deleted = await driveService.deleteOldBackups(30);
    logger.info('Old backups deleted from Google Drive', { deleted });

    logger.info('Database backup to Google Drive completed successfully.');
  } catch (error: unknown) {
    logger.error('Database backup to Google Drive failed', { error });
    // Với script CLI, nên luôn exit code khác 0 khi lỗi
    process.exitCode = 1;
  }
}

// Chỉ chạy nếu file được gọi trực tiếp bằng node/ts-node
// (Jest hoặc các tool khác import file này sẽ không auto chạy main)
if ((require as any).main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  main();
}


