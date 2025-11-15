const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, '../database/studio_tatuagem.sqlite');
const schemaPath = path.resolve(__dirname, '../database/schema_sqlite.sql');

console.log('🗄️ Inicializando banco SQLite:', dbPath);

const schema = fs.readFileSync(schemaPath, 'utf-8');
const db = new sqlite3.Database(dbPath);

// Executa múltiplos comandos SQL do schema
function runSchema(db, schema) {
  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        console.error('❌ Erro ao importar schema:', err.message);
        reject(err);
      } else {
        console.log('✅ Banco SQLite inicializado com sucesso!');
        resolve();
      }
    });
  });
}

runSchema(db, schema)
  .then(() => db.close())
  .catch(() => db.close());
