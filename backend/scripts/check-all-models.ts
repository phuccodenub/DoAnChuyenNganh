import { getSequelize } from '../src/config/db';
import { QueryTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

interface TableInfo {
  tablename: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface ModelCheckResult {
  tableName: string;
  modelFile: string;
  modelExists: boolean;
  dbColumns: string[];
  modelFields: string[];
  missingInModel: string[];
  extraInModel: string[];
  syncPercentage: number;
  status: 'perfect' | 'good' | 'warning' | 'critical' | 'no-model';
}

async function checkAllModels(): Promise<void> {
  const sequelize = getSequelize();
  
  try {
    console.log('🔍 CHECKING ALL MODELS vs DATABASE\n');
    console.log('='.repeat(80));
    
    // Get all tables
    const tables = await sequelize.query<TableInfo>(
      `SELECT tablename FROM pg_tables 
       WHERE schemaname = 'public' 
       AND tablename NOT IN ('SequelizeMeta', 'migrations')
       ORDER BY tablename`,
      { type: QueryTypes.SELECT }
    );
    
    const results: ModelCheckResult[] = [];
    
    for (const table of tables) {
      const tableName = table.tablename;
      
      // Get columns from database
      const dbColumns = await sequelize.query<ColumnInfo>(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns 
         WHERE table_name = '${tableName}'
         ORDER BY ordinal_position`,
        { type: QueryTypes.SELECT }
      );
      
      const dbColumnNames = dbColumns.map(col => col.column_name);
      
      // Find model file (try different naming conventions)
      const possibleNames = [
        `${tableName.replace(/_/g, '-')}.model.ts`,  // snake-case
        `${tableName.replace(/_([a-z])/g, (_, c) => c.toUpperCase())}.model.ts`, // camelCase
      ];
      
      let modelPath = '';
      let modelExists = false;
      
      for (const name of possibleNames) {
        const tryPath = path.join(__dirname, '../src/models', name);
        if (fs.existsSync(tryPath)) {
          modelPath = tryPath;
          modelExists = true;
          break;
        }
      }
      
      let modelFields: string[] = [];
      let missingInModel: string[] = dbColumnNames;
      let extraInModel: string[] = [];
      let syncPercentage = 0;
      
      if (modelExists) {
        // Read model file to extract fields
        const modelContent = fs.readFileSync(modelPath, 'utf-8');
        
        // Extract field definitions from Sequelize.define
        const fieldMatches = modelContent.matchAll(/^\s{2,}(\w+):\s*{/gm);
        modelFields = Array.from(fieldMatches, m => m[1] as string);
        
        // Calculate differences
        missingInModel = dbColumnNames.filter(col => !modelFields.includes(col));
        extraInModel = modelFields.filter(col => !dbColumnNames.includes(col));
        
        const matchCount = modelFields.filter(col => dbColumnNames.includes(col)).length;
        syncPercentage = dbColumnNames.length > 0 
          ? (matchCount / dbColumnNames.length) * 100 
          : 0;
      }
      
      // Determine status
      let status: ModelCheckResult['status'];
      if (!modelExists) {
        status = 'no-model';
      } else if (syncPercentage === 100 && extraInModel.length === 0) {
        status = 'perfect';
      } else if (syncPercentage >= 80) {
        status = 'good';
      } else if (syncPercentage >= 50) {
        status = 'warning';
      } else {
        status = 'critical';
      }
      
      results.push({
        tableName,
        modelFile: modelExists ? path.basename(modelPath) : 'NOT FOUND',
        modelExists,
        dbColumns: dbColumnNames,
        modelFields,
        missingInModel,
        extraInModel,
        syncPercentage,
        status
      });
      
      // Print result
      const statusIcon = {
        'perfect': '✅',
        'good': '🟢',
        'warning': '🟡',
        'critical': '🔴',
        'no-model': '❌'
      }[status];
      
      console.log(`\n${statusIcon} ${tableName.toUpperCase()}`);
      console.log('─'.repeat(80));
      console.log(`Model: ${modelExists ? path.basename(modelPath) : '❌ NOT FOUND'}`);
      console.log(`DB Columns: ${dbColumnNames.length} | Model Fields: ${modelFields.length}`);
      
      if (modelExists) {
        console.log(`Sync: ${syncPercentage.toFixed(1)}%`);
        
        if (missingInModel.length > 0) {
          console.log(`\n❌ Missing in model (${missingInModel.length}):`);
          missingInModel.forEach(col => console.log(`   - ${col}`));
        }
        
        if (extraInModel.length > 0) {
          console.log(`\n⚠️  Extra in model (${extraInModel.length}):`);
          extraInModel.forEach(col => console.log(`   - ${col}`));
        }
        
        if (missingInModel.length === 0 && extraInModel.length === 0) {
          console.log('✅ Perfect sync!');
        }
      } else {
        console.log('❌ Model file not found! Need to create model.');
      }
    }
    
    // Summary
    console.log('\n');
    console.log('='.repeat(80));
    console.log('📊 SUMMARY REPORT');
    console.log('='.repeat(80));
    
    const perfect = results.filter(r => r.status === 'perfect');
    const good = results.filter(r => r.status === 'good');
    const warning = results.filter(r => r.status === 'warning');
    const critical = results.filter(r => r.status === 'critical');
    const noModel = results.filter(r => r.status === 'no-model');
    
    console.log(`\n✅ Perfect (100% sync, no extra): ${perfect.length} tables`);
    perfect.forEach(r => console.log(`   - ${r.tableName}`));
    
    console.log(`\n🟢 Good (80-99% sync): ${good.length} tables`);
    good.forEach(r => console.log(`   - ${r.tableName} (${r.syncPercentage.toFixed(1)}%)`));
    
    console.log(`\n🟡 Warning (50-79% sync): ${warning.length} tables`);
    warning.forEach(r => console.log(`   - ${r.tableName} (${r.syncPercentage.toFixed(1)}%)`));
    
    console.log(`\n🔴 Critical (< 50% sync): ${critical.length} tables`);
    critical.forEach(r => console.log(`   - ${r.tableName} (${r.syncPercentage.toFixed(1)}%)`));
    
    console.log(`\n❌ No Model: ${noModel.length} tables`);
    noModel.forEach(r => console.log(`   - ${r.tableName}`));
    
    // Calculate average
    const modelsWithSync = results.filter(r => r.modelExists);
    const avgSync = modelsWithSync.length > 0
      ? modelsWithSync.reduce((sum, r) => sum + r.syncPercentage, 0) / modelsWithSync.length
      : 0;
    
    console.log(`\n📈 Average Sync: ${avgSync.toFixed(1)}%`);
    console.log(`📊 Total Tables: ${results.length}`);
    console.log(`📁 Models Found: ${modelsWithSync.length}/${results.length}`);
    
    // Save detailed report
    const reportPath = path.join(__dirname, '../MODEL_SYNC_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Detailed report saved: ${reportPath}`);
    
    // Priority recommendations
    console.log('\n');
    console.log('='.repeat(80));
    console.log('🎯 PRIORITY RECOMMENDATIONS');
    console.log('='.repeat(80));
    
    if (noModel.length > 0) {
      console.log('\n🔥 HIGH PRIORITY: Create missing models');
      noModel.forEach(r => console.log(`   - Create ${r.tableName}.model.ts`));
    }
    
    if (critical.length > 0) {
      console.log('\n🔥 HIGH PRIORITY: Fix critical sync issues');
      critical.forEach(r => {
        console.log(`   - ${r.tableName}: ${r.missingInModel.length} fields missing`);
      });
    }
    
    if (warning.length > 0) {
      console.log('\n⚠️  MEDIUM PRIORITY: Improve sync');
      warning.forEach(r => {
        console.log(`   - ${r.tableName}: ${r.missingInModel.length} fields missing`);
      });
    }
    
    if (good.length > 0) {
      console.log('\n✅ LOW PRIORITY: Minor improvements');
      good.forEach(r => {
        console.log(`   - ${r.tableName}: ${r.missingInModel.length} fields missing`);
      });
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run
checkAllModels();
