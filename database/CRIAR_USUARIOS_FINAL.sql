-- ===================================================
-- CRIAR USUÁRIOS PARA TATUADORES - VERSÃO CORRIGIDA
-- ===================================================

USE studio_tatuagem;

-- Mostrar tatuadores existentes
SELECT '=== TATUADORES CADASTRADOS ===' as '';
SELECT id, nome, email, ativo FROM tatuadores;

-- Mostrar usuários existentes
SELECT '=== USUÁRIOS EXISTENTES ===' as '';
SELECT id, nome, email, tipo FROM usuarios;

-- Criar usuários para os tatuadores usando o email deles
INSERT INTO usuarios (nome, email, senha, tipo, ativo, data_cadastro)
SELECT 
    t.nome,
    t.email,
    '$2b$10$YH5xN8mGJ0VqKjXZ5vXKUeN7pM8QYZ8HxW.8zKp9F7xN8mGJ0VqKj', -- tatuador123
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

-- Verificar usuários criados
SELECT '=== USUÁRIOS CRIADOS PARA TATUADORES ===' as '';
SELECT 
    u.id,
    u.nome,
    u.email,
    u.tipo,
    'tatuador123' as senha_padrao,
    u.ativo
FROM usuarios u
WHERE u.tipo = 'tatuador'
ORDER BY u.id;

-- Resumo final
SELECT '=== RESUMO ===' as '';
SELECT 
    COUNT(*) as total_usuarios,
    SUM(CASE WHEN tipo = 'admin' THEN 1 ELSE 0 END) as admins,
    SUM(CASE WHEN tipo = 'tatuador' THEN 1 ELSE 0 END) as tatuadores
FROM usuarios;
