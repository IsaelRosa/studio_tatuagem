const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthController {
  // Login
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ 
          message: 'Email e senha são obrigatórios' 
        });
      }

      // Buscar usuário
      const query = 'SELECT * FROM usuarios WHERE email = ? AND ativo = 1';
      const [rows] = await db.execute(query, [email]);

      if (rows.length === 0) {
        return res.status(401).json({ 
          message: 'Credenciais inválidas' 
        });
      }

      const usuario = rows[0];

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ 
          message: 'Credenciais inválidas' 
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email, 
          tipo: usuario.tipo 
        },
        process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Atualizar último login
      await db.execute(
        'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
        [usuario.id]
      );

      // Remover senha da resposta
      delete usuario.senha;

      return res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Registrar novo usuário
  static async register(req, res) {
    try {
      const { nome, email, senha, tipo, tatuador_id } = req.body;

      // Validações
      if (!nome || !email || !senha) {
        return res.status(400).json({ 
          message: 'Nome, email e senha são obrigatórios' 
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({ 
          message: 'Senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Verificar se email já existe
      const checkQuery = 'SELECT id FROM usuarios WHERE email = ?';
      const [existente] = await db.execute(checkQuery, [email]);

      if (existente.length > 0) {
        return res.status(409).json({ 
          message: 'Email já cadastrado' 
        });
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Inserir usuário
      const insertQuery = `
        INSERT INTO usuarios (nome, email, senha, tipo, tatuador_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await db.execute(insertQuery, [
        nome,
        email,
        senhaHash,
        tipo || 'atendente',
        tatuador_id || null
      ]);

      // Gerar token
      const token = jwt.sign(
        { 
          id: result.insertId, 
          email, 
          tipo: tipo || 'atendente' 
        },
        process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.status(201).json({
        message: 'Usuário registrado com sucesso',
        token,
        usuario: {
          id: result.insertId,
          nome,
          email,
          tipo: tipo || 'atendente'
        }
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Verificar token
  static async verifyToken(req, res) {
    try {
      const usuario = req.usuario; // Adicionado pelo middleware

      return res.json({
        valido: true,
        usuario
      });
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Alterar senha
  static async alterarSenha(req, res) {
    try {
      const usuarioId = req.usuario.id;
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ 
          message: 'Senha atual e nova senha são obrigatórias' 
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ 
          message: 'Nova senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Buscar usuário
      const query = 'SELECT * FROM usuarios WHERE id = ?';
      const [rows] = await db.execute(query, [usuarioId]);

      if (rows.length === 0) {
        return res.status(404).json({ 
          message: 'Usuário não encontrado' 
        });
      }

      const usuario = rows[0];

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ 
          message: 'Senha atual incorreta' 
        });
      }

      // Hash da nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await db.execute(
        'UPDATE usuarios SET senha = ? WHERE id = ?',
        [novaSenhaHash, usuarioId]
      );

      return res.json({
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Recuperar senha (gerar token de recuperação)
  static async recuperarSenha(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          message: 'Email é obrigatório' 
        });
      }

      // Buscar usuário
      const query = 'SELECT id, nome, email FROM usuarios WHERE email = ? AND ativo = 1';
      const [rows] = await db.execute(query, [email]);

      if (rows.length === 0) {
        // Por segurança, retornar sucesso mesmo se o email não existir
        return res.json({
          message: 'Se o email estiver cadastrado, você receberá instruções de recuperação'
        });
      }

      const usuario = rows[0];

      // Gerar token de recuperação (válido por 1 hora)
      const tokenRecuperacao = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          tipo: 'recuperacao'
        },
        process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro',
        { expiresIn: '1h' }
      );

      // TODO: Enviar email com o token
      // Por enquanto, retornar o token na resposta (apenas para desenvolvimento)
      console.log('Token de recuperação:', tokenRecuperacao);
      console.log(`Link de recuperação: ${process.env.FRONTEND_URL}/reset-senha?token=${tokenRecuperacao}`);

      return res.json({
        message: 'Se o email estiver cadastrado, você receberá instruções de recuperação',
        // Remover em produção:
        debug_token: process.env.NODE_ENV === 'development' ? tokenRecuperacao : undefined
      });
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Resetar senha com token
  static async resetarSenha(req, res) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({ 
          message: 'Token e nova senha são obrigatórios' 
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ 
          message: 'Nova senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Verificar token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_super_seguro');
      } catch (error) {
        return res.status(401).json({ 
          message: 'Token inválido ou expirado' 
        });
      }

      if (decoded.tipo !== 'recuperacao') {
        return res.status(401).json({ 
          message: 'Token inválido' 
        });
      }

      // Hash da nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await db.execute(
        'UPDATE usuarios SET senha = ? WHERE id = ?',
        [novaSenhaHash, decoded.id]
      );

      return res.json({
        message: 'Senha resetada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }

  // Alterar senha (usuário logado)
  static async alterarSenha(req, res) {
    try {
      const usuarioId = req.user.id;
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres' });
      }

      // Buscar usuário
      const [usuarios] = await db.execute(
        'SELECT senha FROM usuarios WHERE id = ?',
        [usuarioId]
      );

      if (usuarios.length === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      const senhaCorreta = await bcrypt.compare(senhaAtual, usuarios[0].senha);
      if (!senhaCorreta) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }

      // Hash da nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await db.execute(
        'UPDATE usuarios SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [novaSenhaHash, usuarioId]
      );

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ message: 'Erro ao alterar senha', error: error.message });
    }
  }

  // Esqueceu a senha (gerar token)
  static async esqueceuSenha(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }

      // Buscar usuário
      const [usuarios] = await db.execute(
        'SELECT id, nome FROM usuarios WHERE email = ? AND ativo = 1',
        [email]
      );

      if (usuarios.length === 0) {
        // Por segurança, não revelar se o email existe
        return res.json({ message: 'Se o email existir, um link de recuperação será enviado' });
      }

      // Gerar token único (válido por 1 hora)
      const crypto = require('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiracao = new Date(Date.now() + 3600000); // 1 hora

      // Salvar token no banco
      await db.execute(
        `INSERT INTO tokens_recuperacao (usuario_id, token, expiracao) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE token = VALUES(token), expiracao = VALUES(expiracao)`,
        [usuarios[0].id, token, expiracao]
      );

      // TODO: Enviar email com link de recuperação
      // const link = `http://localhost:3000/redefinir-senha/${token}`;
      // await enviarEmail(email, 'Recuperação de Senha', link);

      console.log(`Token de recuperação para ${email}: ${token}`);
      res.json({ 
        message: 'Se o email existir, um link de recuperação será enviado',
        token // REMOVER EM PRODUÇÃO - só para teste
      });
    } catch (error) {
      console.error('Erro ao processar recuperação de senha:', error);
      res.status(500).json({ message: 'Erro ao processar recuperação de senha' });
    }
  }

  // Redefinir senha com token
  static async redefinirSenha(req, res) {
    try {
      const { token, novaSenha } = req.body;

      if (!token || !novaSenha) {
        return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
      }

      // Verificar token
      const [tokens] = await db.execute(
        `SELECT usuario_id FROM tokens_recuperacao 
         WHERE token = ? AND expiracao > NOW()`,
        [token]
      );

      if (tokens.length === 0) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }

      // Hash da nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      // Atualizar senha
      await db.execute(
        'UPDATE usuarios SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
        [novaSenhaHash, tokens[0].usuario_id]
      );

      // Deletar token usado
      await db.execute(
        'DELETE FROM tokens_recuperacao WHERE token = ?',
        [token]
      );

      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      res.status(500).json({ message: 'Erro ao redefinir senha', error: error.message });
    }
  }

  // Logout (apenas retorna sucesso, token é gerenciado no frontend)
  static async logout(req, res) {
    try {
      return res.json({
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return res.status(500).json({ 
        message: 'Erro interno do servidor' 
      });
    }
  }
}

module.exports = AuthController;
