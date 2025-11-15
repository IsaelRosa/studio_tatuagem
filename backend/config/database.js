
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/studio_tatuagem.sqlite');
console.log('📦 Conectando ao banco SQLite:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('✅ Conectado ao SQLite!');
  }
});

module.exports = db;
