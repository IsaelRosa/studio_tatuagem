const db = require('../config/database');
const Cliente = require('../models/Cliente');

class ClienteDAO {
  // Criar novo cliente
  static create(clienteData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO clientes (
          nome, email, telefone, cpf, data_nascimento, 
          endereco, cidade, estado, cep, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        clienteData.nome,
        clienteData.email,
        clienteData.telefone,
        clienteData.cpf,
        clienteData.data_nascimento,
        clienteData.endereco,
        clienteData.cidade,
        clienteData.estado,
        clienteData.cep,
        clienteData.observacoes
      ];
      db.run(query, values, function (err) {
        if (err) return reject(err);
        ClienteDAO.findById(this.lastID)
          .then(cliente => resolve(cliente))
          .catch(reject);
      });
    });
  }

  // Buscar cliente por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clientes WHERE id = ? AND ativo = 1';
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(new Cliente(row));
      });
    });
  }

  // Buscar cliente por email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clientes WHERE email = ? AND ativo = 1';
      db.get(query, [email], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(new Cliente(row));
      });
    });
  }

  // Buscar cliente por CPF
  static findByCPF(cpf) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM clientes WHERE cpf = ? AND ativo = 1';
      db.get(query, [cpf], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(new Cliente(row));
      });
    });
  }

  // Listar todos os clientes
  static findAll(page = 1, limit = 10, search = '') {
    return new Promise((resolve, reject) => {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      let query = 'SELECT * FROM clientes WHERE ativo = 1';
      let countQuery = 'SELECT COUNT(*) as total FROM clientes WHERE ativo = 1';
      const queryParams = [];
      if (search) {
        query += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        countQuery += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam, searchParam);
      }
      query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);
      db.all(query, queryParams, (err, rows) => {
        if (err) return reject(err);
        db.get(countQuery, search ? queryParams.slice(0, 3) : [], (err2, countResult) => {
          if (err2) return reject(err2);
          const clientes = rows.map(row => new Cliente(row));
          const total = countResult ? countResult.total : 0;
          resolve({ clientes, total });
        });
      });
    });
  }

}

module.exports = ClienteDAO;
