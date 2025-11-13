-- ===================================================
-- CRIAR USUÁRIOS DOS TATUADORES - COPIE E COLE NO MYSQL WORKBENCH
-- ===================================================

USE studio_tatuagem;

-- Limpar possíveis duplicatas (opcional)
-- DELETE FROM usuarios WHERE tipo = 'tatuador';

-- Criar usuários para TODOS os tatuadores
INSERT INTO usuarios (nome, email, senha, tipo, ativo, data_cadastro)
VALUES
    ('Carlos Silva', 'carlos@studio.com', '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', 'tatuador', 1, NOW()),
    ('Ana Santos', 'ana@studio.com', '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', 'tatuador', 1, NOW()),
    ('Roberto Costa', 'roberto@studio.com', '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', 'tatuador', 1, NOW()),
    ('Isael Aparecido rosa', 'isaelrosa@ufla.br', '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', 'tatuador', 1, NOW()),
    ('Isael Aparecido rosa', 'rosa@ufla.br', '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', 'tatuador', 1, NOW())
ON DUPLICATE KEY UPDATE 
    senha = VALUES(senha),
    ativo = VALUES(ativo);

-- Verificar usuários criados
SELECT '========== USUÁRIOS CRIADOS ==========' as '';
SELECT id, nome, email, tipo, 'tatuador123' as senha_padrao, ativo 
FROM usuarios 
WHERE tipo = 'tatuador'
ORDER BY id;

-- Resumo
SELECT '========== RESUMO ==========' as '';
SELECT 
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN tipo = 'admin' THEN 1 ELSE 0 END) as administradores,
    SUM(CASE WHEN tipo = 'tatuador' THEN 1 ELSE 0 END) as tatuadores
FROM usuarios;
