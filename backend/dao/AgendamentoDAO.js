const db = require('../config/database');
const Agendamento = require('../models/Agendamento');

class AgendamentoDAO {
  // Criar novo agendamento
  static create(agendamentoData) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO agendamentos (
          cliente_id, tatuador_id, servico_id, data_agendamento, 
          hora_inicio, hora_fim, descricao_tatuagem, valor_estimado, 
          status, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        agendamentoData.cliente_id,
        agendamentoData.tatuador_id,
        agendamentoData.servico_id,
        agendamentoData.data_agendamento,
        agendamentoData.hora_inicio,
        agendamentoData.hora_fim,
        agendamentoData.descricao_tatuagem,
        agendamentoData.valor_estimado,
        agendamentoData.status || 'agendado',
        agendamentoData.observacoes
      ];
      db.run(query, values, function (err) {
        if (err) return reject(err);
        AgendamentoDAO.findById(this.lastID)
          .then(agendamento => resolve(agendamento))
          .catch(reject);
      });
    });
  }

  // Buscar agendamento por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               t.nome as tatuador_nome, t.telefone as tatuador_telefone,
               s.nome as servico_nome, s.categoria as servico_categoria
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(row);
      });
    });
  }

  // Listar agendamentos com filtros
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               t.nome as tatuador_nome, t.telefone as tatuador_telefone,
               s.nome as servico_nome, s.categoria as servico_categoria
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE 1=1
      `;
      const queryParams = [];
      if (filters.cliente_id) {
        query += ' AND a.cliente_id = ?';
        queryParams.push(filters.cliente_id);
      }
      if (filters.tatuador_id) {
        query += ' AND a.tatuador_id = ?';
        queryParams.push(filters.tatuador_id);
      }
      if (filters.status) {
        query += ' AND a.status = ?';
        queryParams.push(filters.status);
      }
      if (filters.data_inicio && filters.data_fim) {
        query += ' AND a.data_agendamento BETWEEN ? AND ?';
        queryParams.push(filters.data_inicio, filters.data_fim);
      } else if (filters.data_agendamento) {
        query += ' AND DATE(a.data_agendamento) = ?';
        queryParams.push(filters.data_agendamento);
      }
      query += ' ORDER BY a.data_agendamento ASC, a.hora_inicio ASC';
      db.all(query, queryParams, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Verificar disponibilidade do tatuador
  static verificarDisponibilidade(tatuadorId, dataAgendamento, horaInicio, horaFim, agendamentoId = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM agendamentos 
        WHERE tatuador_id = ? 
        AND data_agendamento = ? 
        AND status NOT IN ('cancelado', 'reagendado')
        AND (
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio < ? AND hora_fim > ?) OR
          (hora_inicio >= ? AND hora_fim <= ?)
        )
      `;
      const queryParams = [
        tatuadorId, 
        dataAgendamento, 
        horaFim, horaInicio,
        horaFim, horaInicio,
        horaInicio, horaFim
      ];
      if (agendamentoId) {
        query += ' AND id != ?';
        queryParams.push(agendamentoId);
      }
      db.all(query, queryParams, (err, rows) => {
        if (err) return reject(err);
        resolve(rows.length === 0);
      });
    });
  }

  // Atualizar agendamento
  static update(id, agendamentoData) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE agendamentos SET 
          cliente_id = ?, tatuador_id = ?, servico_id = ?, 
          data_agendamento = ?, hora_inicio = ?, hora_fim = ?, 
          descricao_tatuagem = ?, valor_estimado = ?, valor_final = ?,
          status = ?, observacoes = ?, data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const values = [
        agendamentoData.cliente_id,
        agendamentoData.tatuador_id,
        agendamentoData.servico_id,
        agendamentoData.data_agendamento,
        agendamentoData.hora_inicio,
        agendamentoData.hora_fim,
        agendamentoData.descricao_tatuagem,
        agendamentoData.valor_estimado,
        agendamentoData.valor_final,
        agendamentoData.status,
        agendamentoData.observacoes,
        id
      ];
      db.run(query, values, function (err) {
        if (err) return reject(err);
        AgendamentoDAO.findById(id)
          .then(agendamento => resolve(agendamento))
          .catch(reject);
      });
    });
  }

  // Atualizar status do agendamento
  static updateStatus(id, status, observacoes = null) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE agendamentos SET 
          status = ?, observacoes = COALESCE(?, observacoes), 
          data_atualizacao = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      db.run(query, [status, observacoes, id], function (err) {
        if (err) return reject(err);
        AgendamentoDAO.findById(id)
          .then(agendamento => resolve(agendamento))
          .catch(reject);
      });
    });
  }

  // Excluir agendamento
  static delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM agendamentos WHERE id = ?';
      db.run(query, [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  // Buscar agendamentos do dia
  static findByDate(data) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT a.*, 
               c.nome as cliente_nome, c.telefone as cliente_telefone,
               t.nome as tatuador_nome,
               s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN tatuadores t ON a.tatuador_id = t.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE DATE(a.data_agendamento) = ?
        AND a.status NOT IN ('cancelado')
        ORDER BY a.hora_inicio ASC
      `;
      db.all(query, [data], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  // Relatório de agendamentos por período
  static relatorioMensal(ano, mes) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_agendamentos,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as concluidos,
          COUNT(CASE WHEN status = 'cancelado' THEN 1 END) as cancelados,
          SUM(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) as faturamento,
          AVG(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) as ticket_medio
        FROM agendamentos
        WHERE strftime('%Y', data_agendamento) = ? AND strftime('%m', data_agendamento) = ?
      `;
      db.get(query, [String(ano), String(mes).padStart(2, '0')], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
}

module.exports = AgendamentoDAO;

