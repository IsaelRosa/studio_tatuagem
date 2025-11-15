const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const crypto = require('crypto');

class AuthController {
      // Resetar senha com token de recuperação (alias para redefinirSenha)
      static async resetarSenha(req, res) {
        return AuthController.redefinirSenha(req, res);
      }
    // Solicitar recuperação de senha (gerar token)
    static async esqueceuSenha(req, res) {
      return AuthController.recuperarSenha(req, res);
    }

    // Verificar se token é válido
    static async verifyToken(req, res) {
      try {
        const { token } = req.query;
        if (!token) {
          return res.status(400).json({ message: 'Token é obrigatório' });
        }
        db.get('SELECT usuario_id FROM tokens_recuperacao WHERE token = ? AND expiracao > CURRENT_TIMESTAMP', [token], (err, tokenRow) => {
          if (err) {
            console.error('Erro ao buscar token:', err);
            return res.status(500).json({ message: 'Erro ao buscar token', error: err.message });
          }
          if (!tokenRow) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
          }
          return res.json({ message: 'Token válido', usuarioId: tokenRow.usuario_id });
        });
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(500).json({ message: 'Erro ao verificar token', error: error.message });
      }
    }

    // Alterar senha do usuário logado
    static async alterarSenha(req, res) {
      try {
        const usuarioId = req.usuario?.id;
        const { senhaAtual, novaSenha } = req.body;
        if (!usuarioId || !senhaAtual || !novaSenha) {
          return res.status(400).json({ message: 'Dados obrigatórios não informados' });
        }
        if (novaSenha.length < 6) {
          return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
        }
        db.get('SELECT senha FROM usuarios WHERE id = ?', [usuarioId], async (err, usuario) => {
          if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ message: 'Erro interno do servidor' });
          }
          if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
          }
          const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
          if (!senhaValida) {
            return res.status(401).json({ message: 'Senha atual incorreta' });
          }
          const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
          db.run('UPDATE usuarios SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?', [novaSenhaHash, usuarioId], (err2) => {
            if (err2) {
              console.error('Erro ao atualizar senha:', err2);
              return res.status(500).json({ message: 'Erro ao atualizar senha', error: err2.message });
            }
            return res.json({ message: 'Senha alterada com sucesso' });
          });
        });
      } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({ message: 'Erro ao alterar senha', error: error.message });
      }
    }
  // Registrar novo usuário
  static async register(req, res) {
    try {
      const { nome, email, senha } = req.body;
      if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
      }
      if (senha.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres' });
      }
      // Verifica se o email já existe
      db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err, usuario) => {
        if (err) {
          console.error('Erro ao buscar email:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        if (usuario) {
          return res.status(400).json({ message: 'Email já cadastrado' });
        }
        // Cria hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);
        db.run('INSERT INTO usuarios (nome, email, senha, ativo) VALUES (?, ?, ?, 1)', [nome, email, senhaHash], function(err2) {
          if (err2) {
            console.error('Erro ao registrar usuário:', err2);
            return res.status(500).json({ message: 'Erro ao registrar usuário' });
          }
          return res.status(201).json({ message: 'Usuário registrado com sucesso', usuarioId: this.lastID });
        });
      });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
 static async login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }
    db.get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email], (err, usuario) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro interno do servidor' });
      }
      if (!usuario) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      bcrypt.compare(senha, usuario.senha, (errCompare, senhaValida) => {
        if (errCompare) {
          console.error('Erro ao validar senha:', errCompare);
          return res.status(500).json({ message: 'Erro ao validar senha' });
        }
        if (!senhaValida) {
          return res.status(401).json({ message: 'Credenciais inválidas' });
        }
        const token = jwt.sign(
          { id: usuario.id, tipo: usuario.tipo },
          process.env.JWT_SECRET || 'studio_secret',
          { expiresIn: '8h' }
        );
        db.run('UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?', [usuario.id], (err2) => {
          if (err2) console.error('Erro ao atualizar último login:', err2);
          delete usuario.senha;
          return res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            usuario
          });
        });
      });
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}


  // Recuperação de senha
  static async recuperarSenha(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }
      // Verifica se o usuário existe
      db.get('SELECT id FROM usuarios WHERE email = ?', [email], (err, usuario) => {
        if (err) {
          console.error('Erro ao buscar usuário:', err);
          return res.status(500).json({ message: 'Erro interno do servidor' });
        }
        // Sempre retorna sucesso para não expor se o email existe
        let token = crypto.randomBytes(32).toString('hex');
        const expiracao = new Date(Date.now() + 3600000); // 1 hora
        if (usuario) {
          // Salva token no banco
          db.run('INSERT INTO tokens_recuperacao (usuario_id, token, expiracao) VALUES (?, ?, ?)', [usuario.id, token, expiracao.toISOString()], (err2) => {
            if (err2) {
              console.error('Erro ao salvar token:', err2);
            }
          });
        }
        // TODO: Enviar email com link de recuperação
        // const link = `http://localhost:3000/redefinir-senha/${token}`;
        // await enviarEmail(email, 'Recuperação de Senha', link);
        console.log(`Token de recuperação para ${email}: ${token}`);
        return res.json({
          message: 'Se o email existir, um link de recuperação será enviado',
          token // REMOVER EM PRODUÇÃO - só para teste
        });
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
      db.get(
        `SELECT usuario_id FROM tokens_recuperacao WHERE token = ? AND expiracao > CURRENT_TIMESTAMP`,
        [token],
        async (err, tokenRow) => {
          if (err) {
            console.error('Erro ao buscar token:', err);
            return res.status(500).json({ message: 'Erro ao buscar token', error: err.message });
          }
          if (!tokenRow) {
            return res.status(400).json({ message: 'Token inválido ou expirado' });
          }
          // Hash da nova senha
          const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
          // Atualizar senha
          db.run(
            'UPDATE usuarios SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?',
            [novaSenhaHash, tokenRow.usuario_id],
            (err2) => {
              if (err2) {
                console.error('Erro ao atualizar senha:', err2);
                return res.status(500).json({ message: 'Erro ao atualizar senha', error: err2.message });
              }
              // Deletar token usado
              db.run(
                'DELETE FROM tokens_recuperacao WHERE token = ?',
                [token],
                (err3) => {
                  if (err3) {
                    console.error('Erro ao deletar token:', err3);
                    return res.status(500).json({ message: 'Erro ao deletar token', error: err3.message });
                  }
                  res.json({ message: 'Senha redefinida com sucesso' });
                }
              );
            }
          );
        }
      );
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
