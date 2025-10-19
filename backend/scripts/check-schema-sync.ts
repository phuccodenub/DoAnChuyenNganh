import { getSequelize } from '../src/config/db';
import * as fs from 'fs';
import * as path from 'path';

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface ComparisonResult {
  tableName: string;
  dbColumns: string[];
  modelColumns: string[];
  missingInModel: string[];
  missingInDb: string[];
  syncPercentage: number;
}

async function checkSchemaSync(): Promise<void> {
  const sequelize = getSequelize();
  
  try {
    console.log('🔍 Checking Model-Database Schema Synchronization...\n');
    
    // Get all tables from database
    const [tables] = await sequelize.query<{ tablename: string }>(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT IN ('SequelizeMeta', 'migrations')
      ORDER BY tablename
    `) as any;
    
    const results: ComparisonResult[] = [];
    let totalSync = 0;
    let totalTables = 0;
    
    if (!tables || tables.length === 0) {
      console.log('No tables found!');
      return;
    }
    
    for (const table of tables) {
      const tableName = table.tablename;
      
      // Get columns from database
      const [dbColumns] = await sequelize.query<ColumnInfo>(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position
      `) as any;
      
      if (!dbColumns || dbColumns.length === 0) {
        continue;
      }
      
      const dbColumnNames = dbColumns.map((col: ColumnInfo) => col.column_name);
      
      // Try to find corresponding model
      const modelPath = path.join(__dirname, '../src/models', `${tableName.replace(/_/g, '-')}.model.ts`);
      
      if (!fs.existsSync(modelPath)) {
        console.log(`⚠️  ${tableName}: Model file not found at ${modelPath}`);
        continue;
      }
      
      // Read model file to extract fields (simple regex-based extraction)
      const modelContent = fs.readFileSync(modelPath, 'utf-8');
      const fieldMatches = modelContent.matchAll(/^\s{2}(\w+):\s*{/gm);
      const modelColumns = Array.from(fieldMatches, m => m[1]);
      
      // Calculate differences
      const missingInModel = dbColumnNames.filter((col: string) => !modelColumns.includes(col));
      const missingInDb = modelColumns.filter((col: string) => !dbColumnNames.includes(col));
      
      const syncPercentage = modelColumns.length > 0 
        ? (modelColumns.filter(col => dbColumnNames.includes(col)).length / dbColumnNames.length * 100)
        : 0;
      
      results.push({
        tableName,
        dbColumns: dbColumnNames,
        modelColumns,
        missingInModel,
        missingInDb,
        syncPercentage
      });
      
      totalSync += syncPercentage;
      totalTables++;
      
      // Print result
      const status = syncPercentage === 100 ? '✅' : syncPercentage >= 80 ? '🟡' : '🔴';
      console.log(`${status} ${tableName}:`);
      console.log(`   DB: ${dbColumnNames.length} columns, Model: ${modelColumns.length} columns`);
      console.log(`   Sync: ${syncPercentage.toFixed(1)}%`);
      
      if (missingInModel.length > 0) {
        console.log(`   ❌ Missing in model (${missingInModel.length}): ${missingInModel.slice(0, 5).join(', ')}${missingInModel.length > 5 ? '...' : ''}`);
      }
      
      if (missingInDb.length > 0) {
        console.log(`   ⚠️  Missing in DB (${missingInDb.length}): ${missingInDb.join(', ')}`);
      }
      
      console.log('');
    }
    
    // Summary
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total tables checked: ${totalTables}`);
    console.log(`Average sync: ${(totalSync / totalTables).toFixed(1)}%`);
    console.log('');
    
    const critical = results.filter(r => r.syncPercentage < 50);
    const warning = results.filter(r => r.syncPercentage >= 50 && r.syncPercentage < 80);
    const good = results.filter(r => r.syncPercentage >= 80 && r.syncPercentage < 100);
    const perfect = results.filter(r => r.syncPercentage === 100);
    
    console.log(`🔴 Critical (< 50%): ${critical.length} tables`);
    critical.forEach(r => console.log(`   - ${r.tableName} (${r.syncPercentage.toFixed(1)}%)`));
    
    console.log(`\n🟡 Warning (50-80%): ${warning.length} tables`);
    warning.forEach(r => console.log(`   - ${r.tableName} (${r.syncPercentage.toFixed(1)}%)`));
    
    console.log(`\n🟢 Good (80-99%): ${good.length} tables`);
    good.forEach(r => console.log(`   - ${r.tableName} (${r.syncPercentage.toFixed(1)}%)`));
    
    console.log(`\n✅ Perfect (100%): ${perfect.length} tables`);
    perfect.forEach(r => console.log(`   - ${r.tableName}`));
    
    // Write detailed report
    const reportPath = path.join(__dirname, '../SCHEMA_SYNC_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📝 Detailed report saved to: ${reportPath}`);
    
    // Exit with error code if critical issues found
    if (critical.length > 0) {
      console.log('\n❌ FAILED: Critical schema synchronization issues found!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error checking schema sync:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  checkSchemaSync();
}

export { checkSchemaSync };
