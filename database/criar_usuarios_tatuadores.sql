-- ============================================
-- CRIAR USUÁRIOS PARA TATUADORES
-- ============================================
-- Este script cria usuários no sistema para cada tatuador cadastrado
-- Senha padrão: tatuador123 (deve ser alterada no primeiro login)
-- Hash bcrypt da senha "tatuador123": $2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj

-- Verificar tatuadores sem usuário
SELECT t.id, t.nome, t.email 
FROM tatuadores t 
LEFT JOIN usuarios u ON t.email = u.email 
WHERE u.id IS NULL AND t.ativo = 1;

-- Inserir usuários para tatuadores ativos que não têm conta
INSERT INTO usuarios (nome, email, senha, tipo, ativo)
SELECT 
    t.nome,
    t.email,
    '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', -- senha: tatuador123
    'tatuador' as tipo,
    1 as ativo
FROM tatuadores t
LEFT JOIN usuarios u ON t.email = u.email
WHERE u.id IS NULL AND t.ativo = 1 AND t.email IS NOT NULL AND t.email != '';

-- Verificar usuários criados
SELECT 
    u.id,
    u.nome,
    u.email,
    u.tipo,
    u.ativo,
    'tatuador123' as senha_padrao
FROM usuarios u
WHERE u.tipo = 'tatuador'
ORDER BY u.nome;

-- ============================================
-- CREDENCIAIS DE ACESSO
-- ============================================
-- ADMINISTRADOR:
--   Email: admin@studio.com
--   Senha: admin123
--
-- TATUADORES (todos):
--   Email: (email do tatuador)
--   Senha: tatuador123
--
-- IMPORTANTE: Os tatuadores devem alterar a senha no primeiro acesso!
-- ============================================
