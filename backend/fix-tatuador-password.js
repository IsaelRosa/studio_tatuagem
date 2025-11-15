const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database/studio_tatuagem.sqlite');
const db = new sqlite3.Database(dbPath);

const email = 'carlos@studio.com';
const senha = 'carlos123';

bcrypt.hash(senha, 10, (err, hash) => {
  if (err) throw err;
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) throw err;
    if (usuario) {
      db.run('UPDATE usuarios SET senha = ? WHERE id = ?', [hash, usuario.id], function (err) {
        if (err) throw err;
        console.log('✅ Senha do tatuador atualizada!');
        db.close();
      });
    } else {
      // Vincula ao tatuador com mesmo email
      db.get('SELECT id FROM tatuadores WHERE email = ?', [email], (err, tatuador) => {
        if (err) throw err;
        if (!tatuador) {
          console.log('❌ Tatuador não encontrado!');
          db.close();
          return;
        }
        db.run('INSERT INTO usuarios (nome, email, senha, tipo, tatuador_id, ativo) VALUES (?, ?, ?, ?, ?, 1)', [
          'Carlos Silva', email, hash, 'tatuador', tatuador.id
        ], function (err) {
          if (err) throw err;
          console.log('✅ Usuário tatuador criado!');
          db.close();
        });
      });
    }
  });
});
