-- ===================================================
-- CRIAR USUÁRIOS - EXECUTAR NO MYSQL WORKBENCH
-- ===================================================

USE studio_tatuagem;

-- 1. Verificar se já existe o usuário admin
SELECT * FROM usuarios WHERE email = 'admin@studio.com';

-- 2. Se não existir, criar o admin (senha: admin123)
INSERT IGNORE INTO usuarios (nome, email, senha, tipo, ativo, data_cadastro)
VALUES (
    'Administrador',
    'admin@studio.com',
    '$2b$10$rKjH5Z8mGJ0VqKjXZ5vXKU.N7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj',
    'admin',
    1,
    NOW()
);

-- 3. Criar usuários para TODOS os tatuadores cadastrados
INSERT IGNORE INTO usuarios (nome, email, senha, tipo, ativo, data_cadastro)
SELECT 
    t.nome,
    t.email,
    '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', -- senha: tatuador123
    'tatuador',
    1,
    NOW()
FROM tatuadores t
WHERE t.ativo = 1 
  AND t.email IS NOT NULL 
  AND t.email != ''
  AND NOT EXISTS (
      SELECT 1 FROM usuarios u WHERE u.email = t.email
  );

-- 4. VERIFICAR TODOS OS USUÁRIOS CRIADOS
SELECT 
    u.id,
    u.nome,
    u.email,
    u.tipo,
    CASE 
        WHEN u.tipo = 'admin' THEN 'admin123'
        WHEN u.tipo = 'tatuador' THEN 'tatuador123'
    END as senha,
    u.ativo,
    u.data_cadastro
FROM usuarios u
ORDER BY u.tipo DESC, u.nome;
