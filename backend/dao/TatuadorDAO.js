const db = require('../config/database');
const Tatuador = require('../models/Tatuador');

class TatuadorDAO {
  // Criar novo tatuador
  static create(tatuadorData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO tatuadores (
          nome, email, telefone, especialidades, biografia, 
          portfolio_url, instagram, valor_hora, disponibilidade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        tatuadorData.nome || null,
        tatuadorData.email || null,
        tatuadorData.telefone || null,
        tatuadorData.especialidades || null,
        tatuadorData.biografia || null,
        tatuadorData.portfolio_url || null,
        tatuadorData.instagram || null,
        tatuadorData.valor_hora || null,
        JSON.stringify(tatuadorData.disponibilidade || {})
      ];
      db.run(query, values, function (err) {
        if (err) return reject(err);
        TatuadorDAO.findById(this.lastID)
          .then(tatuador => resolve(tatuador))
          .catch(reject);
      });
    });
  }

  // Buscar tatuador por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM tatuadores WHERE id = ? AND ativo = 1';
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        // Parse do JSON de disponibilidade
        if (row.disponibilidade) {
          try {
            row.disponibilidade = JSON.parse(row.disponibilidade);
          } catch (e) {
            row.disponibilidade = {};
          }
        }
        resolve(new Tatuador(row));
      });
    });
  }

  // Buscar tatuador por email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM tatuadores WHERE email = ? AND ativo = 1';
      db.get(query, [email], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        if (row.disponibilidade) {
          try {
            row.disponibilidade = JSON.parse(row.disponibilidade);
          } catch (e) {
            row.disponibilidade = {};
          }
        }
        resolve(new Tatuador(row));
      });
    });
  }

  // Listar todos os tatuadores
  static findAll(page = 1, limit = 10, search = '', especialidade = '', apenasAtivos = true) {
    return new Promise((resolve, reject) => {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      let query = 'SELECT * FROM tatuadores WHERE 1=1';
      let countQuery = 'SELECT COUNT(*) as total FROM tatuadores WHERE 1=1';
      const queryParams = [];
      const countParams = [];
      if (apenasAtivos) {
        query += ' AND ativo = ?';
        countQuery += ' AND ativo = ?';
        queryParams.push(1);
        countParams.push(1);
      }
      if (search) {
        query += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        countQuery += ' AND (nome LIKE ? OR email LIKE ? OR telefone LIKE ?)';
        const searchParam = `%${search}%`;
        queryParams.push(searchParam, searchParam, searchParam);
        countParams.push(searchParam, searchParam, searchParam);
      }
      if (especialidade) {
        query += ' AND especialidades LIKE ?';
        countQuery += ' AND especialidades LIKE ?';
        const espParam = `%${especialidade}%`;
        queryParams.push(espParam);
        countParams.push(espParam);
      }
      query += ' ORDER BY nome ASC LIMIT ? OFFSET ?';
      queryParams.push(limitNum, offset);
      db.all(query, queryParams, (err, rows) => {
        if (err) return reject(err);
        db.get(countQuery, countParams, (err2, countResult) => {
          if (err2) return reject(err2);
          const tatuadores = rows.map(row => {
            if (row.disponibilidade) {
              try {
                row.disponibilidade = JSON.parse(row.disponibilidade);
              } catch (e) {
                row.disponibilidade = {};
              }
            }
            return new Tatuador(row);
          });
          resolve({
            data: tatuadores,
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

  // Listar tatuadores ativos (simplificado)
  static findAllActive() {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, nome, email, especialidades, valor_hora FROM tatuadores WHERE ativo = 1 ORDER BY nome ASC';
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        const result = rows.map(row => {
          if (row.disponibilidade) {
            try {
              row.disponibilidade = JSON.parse(row.disponibilidade);
            } catch (e) {
              row.disponibilidade = {};
            }
          }
          return new Tatuador(row);
        });
        resolve(result);
      });
    });
  }

  // Atualizar tatuador
  static update(id, tatuadorData) {
    return new Promise((resolve, reject) => {
      const updates = [];
      const values = [];
      if (tatuadorData.nome !== undefined) {
        updates.push('nome = ?');
        values.push(tatuadorData.nome);
      }
      if (tatuadorData.email !== undefined) {
        updates.push('email = ?');
        values.push(tatuadorData.email);
      }
      if (tatuadorData.telefone !== undefined) {
        updates.push('telefone = ?');
        values.push(tatuadorData.telefone);
      }
      if (tatuadorData.especialidades !== undefined) {
        updates.push('especialidades = ?');
        values.push(tatuadorData.especialidades);
      }
      if (tatuadorData.biografia !== undefined) {
        updates.push('biografia = ?');
        values.push(tatuadorData.biografia);
      }
      if (tatuadorData.portfolio_url !== undefined) {
        updates.push('portfolio_url = ?');
        values.push(tatuadorData.portfolio_url);
      }
      if (tatuadorData.instagram !== undefined) {
        updates.push('instagram = ?');
        values.push(tatuadorData.instagram);
      }
      if (tatuadorData.valor_hora !== undefined) {
        updates.push('valor_hora = ?');
        values.push(tatuadorData.valor_hora);
      }
      if (tatuadorData.disponibilidade !== undefined) {
        updates.push('disponibilidade = ?');
        values.push(JSON.stringify(tatuadorData.disponibilidade));
      }
      if (updates.length === 0) {
        return reject(new Error('Nenhum campo para atualizar'));
      }
      values.push(id);
      const query = `UPDATE tatuadores SET ${updates.join(', ')} WHERE id = ?`;
      db.run(query, values, function (err) {
        if (err) return reject(err);
        TatuadorDAO.findById(id)
          .then(tatuador => resolve(tatuador))
          .catch(reject);
      });
    });
  }

  // Excluir tatuador (soft delete)
  static delete(id) {
    return new Promise((resolve, reject) => {
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM agendamentos 
        WHERE tatuador_id = ? 
        AND data_agendamento >= date('now') 
        AND status IN ('agendado', 'confirmado')
      `;
      db.get(checkQuery, [id], (err, checkResult) => {
        if (err) return reject(err);
        if (checkResult && checkResult.count > 0) {
          return reject(new Error('Não é possível excluir tatuador com agendamentos futuros'));
        }
        const query = 'UPDATE tatuadores SET ativo = 0 WHERE id = ?';
        db.run(query, [id], function (err2) {
          if (err2) return reject(err2);
          resolve(this.changes > 0);
        });
      });
    });
  }

  // Reativar tatuador
  static reactivate(id) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE tatuadores SET ativo = 1 WHERE id = ?';
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  // Buscar agendamentos do tatuador
  static findAgendamentos(tatuadorId, dataInicio = null, dataFim = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT a.*, c.nome as cliente_nome, s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.tatuador_id = ?
      `;
      const params = [tatuadorId];
      if (dataInicio) {
        query += ' AND a.data_agendamento >= ?';
        params.push(dataInicio);
      }
      if (dataFim) {
        query += ' AND a.data_agendamento <= ?';
        params.push(dataFim);
      }
      query += ' ORDER BY a.data_agendamento DESC, a.hora_inicio DESC';
      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Verificar disponibilidade do tatuador em uma data/hora específica
  static verificarDisponibilidade(tatuadorId, data, horaInicio, horaFim, agendamentoIdExcluir = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT COUNT(*) as count
        FROM agendamentos
        WHERE tatuador_id = ?
        AND data_agendamento = ?
        AND status IN ('agendado', 'confirmado', 'em_andamento')
        AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_fim <= ?)
        )
      `;
      const params = [
        tatuadorId,
        data,
        horaFim, horaInicio,
        horaFim, horaFim,
        horaInicio, horaFim
      ];
      if (agendamentoIdExcluir) {
        query += ' AND id != ?';
        params.push(agendamentoIdExcluir);
      }
      db.get(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result && result.count === 0);
      });
    });
  }

  // Buscar estatísticas do tatuador
  static getEstatisticas(tatuadorId, mes = null, ano = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          COUNT(*) as total_agendamentos,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
          COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
          SUM(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) as faturamento_total
        FROM agendamentos
        WHERE tatuador_id = ?
      `;
      const params = [tatuadorId];
      if (ano) {
        query += " AND strftime('%Y', data_agendamento) = ?";
        params.push(String(ano));
      }
      if (mes) {
        query += " AND strftime('%m', data_agendamento) = ?";
        params.push(String(mes).padStart(2, '0'));
      }
      db.get(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = TatuadorDAO;


