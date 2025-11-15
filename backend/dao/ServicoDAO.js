const db = require('../config/database');
const Servico = require('../models/Servico');

class ServicoDAO {
  // Criar novo serviço
  static create(servicoData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO servicos (
          nome, descricao, preco_base, duracao_estimada
        ) VALUES (?, ?, ?, ?)
      `;
      const values = [
        servicoData.nome || null,
        servicoData.descricao || null,
        servicoData.preco_base || null,
        servicoData.duracao_estimada || null
      ];
      db.run(query, values, function (err) {
        if (err) return reject(err);
        ServicoDAO.findById(this.lastID)
          .then(servico => resolve(servico))
          .catch(reject);
      });
    });
  }

  // Buscar serviço por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM servicos WHERE id = ? AND ativo = 1';
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(new Servico(row));
      });
    });
  }

  // Listar todos os serviços
  static findAll(page = 1, limit = 10, search = '') {
    return new Promise((resolve, reject) => {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let query = 'SELECT * FROM servicos WHERE ativo = 1';
      let countQuery = 'SELECT COUNT(*) as total FROM servicos WHERE ativo = 1';
      const queryParams = [];
      const countParams = [];
      if (search) {
        query += ' AND (nome LIKE ? OR descricao LIKE ?)';
        countQuery += ' AND (nome LIKE ? OR descricao LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam);
        countParams.push(searchParam, searchParam);
      }
      query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);
      db.all(query, queryParams, (err, rows) => {
        if (err) return reject(err);
        db.get(countQuery, countParams, (err2, countResult) => {
          if (err2) return reject(err2);
          const servicos = rows.map(row => new Servico(row));
          resolve({
            data: servicos,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: countResult ? countResult.total : 0,
              totalPages: countResult ? Math.ceil(countResult.total / limitNum) : 1
            }
          });
        });
      });
    });
  }

  // Listar serviços ativos (simplificado)
  static findAllActive() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, nome, descricao, preco_base, duracao_estimada FROM servicos WHERE ativo = 1 ORDER BY nome ASC';
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => new Servico(row)));
      });
    });
  }

  // Atualizar serviço
  static update(id, servicoData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE servicos SET 
          nome = ?, 
          descricao = ?, 
          preco_base = ?, 
          duracao_estimada = ?
        WHERE id = ? AND ativo = 1
      `;
      const values = [
        servicoData.nome || null,
        servicoData.descricao || null,
        servicoData.preco_base || null,
        servicoData.duracao_estimada || null,
        id
      ];
      db.run(query, values, function (err) {
        if (err) return reject(err);
        ServicoDAO.findById(id)
          .then(servico => resolve(servico))
          .catch(reject);
      });
    });
  }

  // Excluir serviço (soft delete)
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE servicos SET ativo = 0 WHERE id = ?';
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  // Reativar serviço
  static reactivate(id) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE servicos SET ativo = 1 WHERE id = ?';
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  // Buscar serviços por faixa de preço
  static findByPriceRange(minPrice, maxPrice) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM servicos 
        WHERE ativo = 1 
        AND preco_base >= ? 
        AND preco_base <= ?
        ORDER BY preco_base ASC
      `;
      db.all(query, [minPrice, maxPrice], (err, rows) => {
        if (err) return reject(err);
        resolve(rows.map(row => new Servico(row)));
      });
    });
  }
}

module.exports = ServicoDAO;

