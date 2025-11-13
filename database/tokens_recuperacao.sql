-- Tabela para tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS tokens_recuperacao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiracao DATETIME NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_expiracao (expiracao)
);

SELECT 'Tabela tokens_recuperacao criada com sucesso!' AS resultado;
