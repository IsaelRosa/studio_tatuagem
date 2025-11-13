USE studio_tatuagem;

INSERT INTO usuarios (nome, email, senha, tipo, ativo, data_cadastro)
VALUES ('Carlos Silva', 'carlos@studio.com', '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', 'tatuador', 1, NOW())
ON DUPLICATE KEY UPDATE senha = VALUES(senha);

SELECT id, nome, email, tipo, ativo FROM usuarios WHERE email = 'carlos@studio.com';
