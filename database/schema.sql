-- Banco de dados para Sistema de Gestão de Studio de Tatuagem
-- Criado em: 10/11/2025

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS studio_tatuagem 
DEFAULT CHARACTER SET utf8mb4 
DEFAULT COLLATE utf8mb4_unicode_ci;

USE studio_tatuagem;

-- Tabela de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE,
    endereco TEXT,
    cidade VARCHAR(50),
    estado VARCHAR(2),
    cep VARCHAR(10),
    observacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    INDEX idx_clientes_email (email),
    INDEX idx_clientes_cpf (cpf),
    INDEX idx_clientes_nome (nome)
);

-- Tabela de tatuadores
CREATE TABLE tatuadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    especialidades TEXT,
    biografia TEXT,
    portfolio_url VARCHAR(255),
    instagram VARCHAR(100),
    valor_hora DECIMAL(10,2),
    disponibilidade JSON, -- Horários disponíveis por dia da semana
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    INDEX idx_tatuadores_email (email),
    INDEX idx_tatuadores_nome (nome)
);

-- Tabela de serviços
CREATE TABLE servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco_base DECIMAL(10,2) NOT NULL,
    duracao_estimada INT NOT NULL, -- em minutos
    categoria ENUM(
        'tatuagem_pequena', 'tatuagem_media', 'tatuagem_grande', 
        'retoque', 'cover_up', 'piercing', 'remocao', 'consulta'
    ) DEFAULT 'tatuagem_pequena',
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_servicos_categoria (categoria),
    INDEX idx_servicos_nome (nome)
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    tatuador_id INT NOT NULL,
    servico_id INT,
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME,
    descricao_tatuagem TEXT NOT NULL,
    valor_estimado DECIMAL(10,2),
    valor_final DECIMAL(10,2),
    status ENUM(
        'agendado', 'confirmado', 'em_andamento', 
        'concluido', 'cancelado', 'reagendado'
    ) DEFAULT 'agendado',
    observacoes TEXT,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    FOREIGN KEY (tatuador_id) REFERENCES tatuadores(id) ON DELETE RESTRICT,
    FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE SET NULL,
    
    INDEX idx_agendamentos_cliente (cliente_id),
    INDEX idx_agendamentos_tatuador (tatuador_id),
    INDEX idx_agendamentos_data (data_agendamento),
    INDEX idx_agendamentos_status (status)
);

-- Tabela de usuários do sistema (para autenticação)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('admin', 'tatuador', 'atendente') DEFAULT 'atendente',
    tatuador_id INT NULL, -- Vinculação com tatuador se aplicável
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    
    FOREIGN KEY (tatuador_id) REFERENCES tatuadores(id) ON DELETE SET NULL,
    INDEX idx_usuarios_email (email)
);

-- Tabela de histórico de agendamentos (para auditoria)
CREATE TABLE historico_agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agendamento_id INT NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    usuario_id INT,
    observacoes TEXT,
    data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_historico_agendamento (agendamento_id)
);

-- Tabela de fotos de trabalhos (portfolio)
CREATE TABLE portfolio_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tatuador_id INT NOT NULL,
    agendamento_id INT,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    descricao TEXT,
    tags VARCHAR(255),
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ativo BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (tatuador_id) REFERENCES tatuadores(id) ON DELETE CASCADE,
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE SET NULL,
    INDEX idx_portfolio_tatuador (tatuador_id)
);

-- ========================================
-- INSERÇÃO DE DADOS INICIAIS
-- ========================================

-- Inserir serviços básicos
INSERT INTO servicos (nome, descricao, preco_base, duracao_estimada, categoria) VALUES
('Tatuagem Pequena', 'Tatuagem até 5cm', 150.00, 60, 'tatuagem_pequena'),
('Tatuagem Média', 'Tatuagem entre 5cm e 15cm', 300.00, 120, 'tatuagem_media'),
('Tatuagem Grande', 'Tatuagem maior que 15cm', 500.00, 240, 'tatuagem_grande'),
('Retoque', 'Retoque em tatuagem existente', 100.00, 45, 'retoque'),
('Cover Up', 'Cobertura de tatuagem antiga', 400.00, 180, 'cover_up'),
('Piercing', 'Colocação de piercing', 80.00, 30, 'piercing'),
('Consulta', 'Consulta e orçamento', 50.00, 30, 'consulta');

-- Inserir tatuadores exemplo
INSERT INTO tatuadores (nome, email, telefone, especialidades, biografia, valor_hora) VALUES
('Carlos Silva', 'carlos@studio.com', '(11) 99999-1111', 'Realismo, Blackwork', 'Tatuador com 10 anos de experiência em realismo e blackwork.', 120.00),
('Ana Santos', 'ana@studio.com', '(11) 99999-2222', 'Fine Line, Aquarela', 'Especialista em traços finos e técnicas de aquarela.', 100.00),
('Roberto Costa', 'roberto@studio.com', '(11) 99999-3333', 'Old School, New School', 'Mestre em estilos clássicos e modernos de tatuagem.', 110.00);

-- Inserir usuário administrador
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Administrador', 'admin@studio.com', '$2a$10$rOYDOqhM7gAI5zw.B5JqOeOEdrFTJq5gkT9yoO5OqO5OqO5OqO5OqO', 'admin');

-- ========================================
-- VIEWS ÚTEIS
-- ========================================

-- View para dashboard de agendamentos
CREATE VIEW vw_agendamentos_dashboard AS
SELECT 
    a.id,
    a.data_agendamento,
    a.hora_inicio,
    a.hora_fim,
    a.status,
    a.valor_estimado,
    c.nome AS cliente_nome,
    c.telefone AS cliente_telefone,
    t.nome AS tatuador_nome,
    s.nome AS servico_nome,
    s.categoria AS servico_categoria
FROM agendamentos a
LEFT JOIN clientes c ON a.cliente_id = c.id
LEFT JOIN tatuadores t ON a.tatuador_id = t.id
LEFT JOIN servicos s ON a.servico_id = s.id
WHERE a.status NOT IN ('cancelado')
ORDER BY a.data_agendamento ASC, a.hora_inicio ASC;

-- View para relatório financeiro
CREATE VIEW vw_relatorio_financeiro AS
SELECT 
    YEAR(data_agendamento) AS ano,
    MONTH(data_agendamento) AS mes,
    COUNT(*) AS total_agendamentos,
    COUNT(CASE WHEN status = 'concluido' THEN 1 END) AS agendamentos_concluidos,
    SUM(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) AS faturamento_total,
    AVG(CASE WHEN status = 'concluido' THEN valor_final ELSE 0 END) AS ticket_medio
FROM agendamentos
GROUP BY YEAR(data_agendamento), MONTH(data_agendamento)
ORDER BY ano DESC, mes DESC;

-- ========================================
-- PROCEDURES E FUNCTIONS
-- ========================================

DELIMITER $$

-- Procedure para verificar disponibilidade de tatuador
CREATE PROCEDURE sp_verificar_disponibilidade(
    IN p_tatuador_id INT,
    IN p_data_agendamento DATE,
    IN p_hora_inicio TIME,
    IN p_hora_fim TIME,
    IN p_agendamento_id INT,
    OUT p_disponivel BOOLEAN
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_count
    FROM agendamentos
    WHERE tatuador_id = p_tatuador_id 
    AND data_agendamento = p_data_agendamento
    AND status NOT IN ('cancelado', 'reagendado')
    AND (
        (hora_inicio < p_hora_fim AND hora_fim > p_hora_inicio) OR
        (hora_inicio < p_hora_fim AND hora_fim > p_hora_inicio) OR
        (hora_inicio >= p_hora_inicio AND hora_fim <= p_hora_fim)
    )
    AND (p_agendamento_id IS NULL OR id != p_agendamento_id);
    
    SET p_disponivel = (v_count = 0);
END$$

-- Function para calcular idade do cliente
CREATE FUNCTION fn_calcular_idade(p_data_nascimento DATE)
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_idade INT;
    
    IF p_data_nascimento IS NULL THEN
        RETURN NULL;
    END IF;
    
    SET v_idade = FLOOR(DATEDIFF(CURDATE(), p_data_nascimento) / 365.25);
    
    RETURN v_idade;
END$$

DELIMITER ;

-- ========================================
-- TRIGGERS
-- ========================================

DELIMITER $$

-- Trigger para registrar histórico de alterações de status
CREATE TRIGGER tr_agendamento_status_historico
AFTER UPDATE ON agendamentos
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO historico_agendamentos (
            agendamento_id, 
            status_anterior, 
            status_novo, 
            observacoes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            CONCAT('Status alterado de ', OLD.status, ' para ', NEW.status)
        );
    END IF;
END$$

DELIMITER ;

-- ========================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ========================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_agendamentos_tatuador_data ON agendamentos(tatuador_id, data_agendamento);
CREATE INDEX idx_agendamentos_cliente_status ON agendamentos(cliente_id, status);
CREATE INDEX idx_agendamentos_data_status ON agendamentos(data_agendamento, status);

-- Comentários nas tabelas
ALTER TABLE clientes COMMENT = 'Tabela de clientes do studio de tatuagem';
ALTER TABLE tatuadores COMMENT = 'Tabela de tatuadores do studio';
ALTER TABLE servicos COMMENT = 'Tabela de serviços oferecidos pelo studio';
ALTER TABLE agendamentos COMMENT = 'Tabela de agendamentos de tatuagens';
ALTER TABLE usuarios COMMENT = 'Tabela de usuários do sistema';
ALTER TABLE historico_agendamentos COMMENT = 'Histórico de alterações nos agendamentos';
ALTER TABLE portfolio_fotos COMMENT = 'Fotos do portfolio dos tatuadores';

-- Fim do script de criação do banco de dados
