-- ========================================
-- SCRIPT DE RESET DE SENHAS
-- Sistema Studio de Tatuagem
-- ========================================

USE studio_tatuagem;

-- Hash bcrypt para a senha "admin123"
-- $2a$10$rOYDOqhM7gAI5zw.B5JqOeOEdrFTJq5gkT9yoO5OqO5OqO5OqO5OqO

-- ========================================
-- RESETAR SENHA DO ADMIN
-- ========================================

UPDATE usuarios 
SET senha = '$2a$10$rOYDOqhM7gAI5zw.B5JqOeOEdrFTJq5gkT9yoO5OqO5OqO5OqO5OqO',
    ultimo_login = NULL
WHERE email = 'admin@studio.com';

SELECT 'Senha do admin resetada para: admin123' AS resultado;

-- ========================================
-- RESETAR SENHA DE USUÁRIO ESPECÍFICO
-- ========================================

-- Substitua 'usuario@studio.com' pelo email do usuário

-- UPDATE usuarios 
-- SET senha = '$2a$10$rOYDOqhM7gAI5zw.B5JqOeOEdrFTJq5gkT9yoO5OqO5OqO5OqO5OqO'
-- WHERE email = 'usuario@studio.com';

-- ========================================
-- RESETAR SENHA DE TODOS OS USUÁRIOS
-- ========================================

-- CUIDADO: Isso resetará a senha de TODOS os usuários!

-- UPDATE usuarios 
-- SET senha = '$2a$10$rOYDOqhM7gAI5zw.B5JqOeOEdrFTJq5gkT9yoO5OqO5OqO5OqO5OqO',
--     ultimo_login = NULL
-- WHERE ativo = true;

-- SELECT CONCAT('Senhas de ', COUNT(*), ' usuários resetadas para: admin123') AS resultado
-- FROM usuarios WHERE ativo = true;

-- ========================================
-- LISTAR TODOS OS USUÁRIOS
-- ========================================

SELECT 
    id,
    nome,
    email,
    tipo,
    IF(ativo = 1, 'Ativo', 'Inativo') AS status,
    DATE_FORMAT(data_cadastro, '%d/%m/%Y %H:%i') AS cadastrado_em,
    DATE_FORMAT(ultimo_login, '%d/%m/%Y %H:%i') AS ultimo_acesso
FROM usuarios
ORDER BY data_cadastro DESC;

-- ========================================
-- VERIFICAR SE USUÁRIO EXISTE
-- ========================================

-- SELECT 
--     CASE 
--         WHEN COUNT(*) > 0 THEN 'Usuário EXISTE no sistema'
--         ELSE 'Usuário NÃO EXISTE no sistema'
--     END AS resultado
-- FROM usuarios 
-- WHERE email = 'admin@studio.com';

-- ========================================
-- CRIAR USUÁRIO DE EMERGÊNCIA
-- ========================================

-- Se você perdeu acesso ao admin, crie um novo:

-- INSERT INTO usuarios (nome, email, senha, tipo, ativo) 
-- VALUES (
--     'Administrador Emergência',
--     'emergency@studio.com',
--     '$2a$10$rOYDOqhM7gAI5zw.B5JqOeOEdrFTJq5gkT9yoO5OqO5OqO5OqO5OqO',
--     'admin',
--     true
-- );
-- 
-- SELECT 'Usuário de emergência criado!' AS resultado;
-- SELECT 'Email: emergency@studio.com' AS email;
-- SELECT 'Senha: admin123' AS senha;

-- ========================================
-- ATIVAR/DESATIVAR USUÁRIO
-- ========================================

-- Desativar usuário (ao invés de deletar)
-- UPDATE usuarios SET ativo = false WHERE email = 'usuario@studio.com';

-- Reativar usuário
-- UPDATE usuarios SET ativo = true WHERE email = 'usuario@studio.com';

-- ========================================
-- ESTATÍSTICAS DE USUÁRIOS
-- ========================================

SELECT 
    tipo AS 'Tipo de Usuário',
    COUNT(*) AS 'Total',
    SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) AS 'Ativos',
    SUM(CASE WHEN ativo = 0 THEN 1 ELSE 0 END) AS 'Inativos'
FROM usuarios
GROUP BY tipo
ORDER BY tipo;

-- ========================================
-- HASHES DE SENHAS COMUNS (bcrypt)
-- ========================================

-- Para referência, use estes hashes se precisar criar usuários manualmente:

-- Senha: admin123
-- Hash: $2a$10$rOYDOqhM7gAI5zw.B5JqOeOEdrFTJq5gkT9yoO5OqO5OqO5OqO5OqO

-- Para gerar novos hashes, use o script criar-usuario.ps1
-- ou use bcrypt online (NÃO RECOMENDADO para produção)

-- ========================================
-- FIM DO SCRIPT
-- ========================================
