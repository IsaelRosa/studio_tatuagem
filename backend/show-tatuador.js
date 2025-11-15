const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/studio_tatuagem.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'carlos@studio.com';
db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
  if (err) throw err;
  if (!usuario) {
    console.log('❌ Usuário não encontrado!');
  } else {
    console.log('Usuário encontrado:', usuario);
  }
  db.close();
});
