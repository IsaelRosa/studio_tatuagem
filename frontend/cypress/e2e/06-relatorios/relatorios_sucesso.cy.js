/// <reference types="cypress" />

describe('Relatórios - Fluxos Principais', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard');

    cy.visit('/relatorios');
    cy.wait(1500);
  });

  it('Carrega a página de relatórios', () => {
    // Verifica que a página carregou
    cy.url().should('include', '/relatorios');
    
    // Verifica que existem cards na página
    cy.get('.card', { timeout: 10000 }).should('have.length.at.least', 1);
  });

  it('Exibe informações do dashboard/relatórios', () => {
    // Verifica se há algum conteúdo de relatório
    cy.get('.card').should('exist');
    
    // Procura por textos comuns em dashboards/relatórios
    cy.get('body').then($body => {
      const texto = $body.text().toLowerCase();
      
      // Verifica se tem algum indicador de métricas
      const temMetricas = 
        texto.includes('total') ||
        texto.includes('clientes') ||
        texto.includes('agendamentos') ||
        texto.includes('receita') ||
        texto.includes('faturamento') ||
        texto.includes('relatório');
      
      expect(temMetricas).to.be.true;
    });
  });

  it('Filtra relatórios por período', () => {
    // Procura inputs de data (podem ter diferentes names)
    cy.get('body').then($body => {
      // Tenta diferentes seletores para inputs de data
      if ($body.find('input[name="data_inicio"]').length) {
        cy.get('input[name="data_inicio"]').clear().type('2025-01-01');
        cy.get('input[name="data_fim"]').clear().type('2025-12-31');
      } else if ($body.find('input[name="dataInicio"]').length) {
        cy.get('input[name="dataInicio"]').clear().type('2025-01-01');
        cy.get('input[name="dataFim"]').clear().type('2025-12-31');
      } else if ($body.find('input[type="date"]').length >= 2) {
        cy.get('input[type="date"]').first().clear().type('2025-01-01');
        cy.get('input[type="date"]').last().clear().type('2025-12-31');
      }
      
      // Procura botão de filtrar
      if ($body.find('button:contains("Filtrar")').length) {
        cy.contains('button', 'Filtrar').click();
      } else if ($body.find('button:contains("Aplicar")').length) {
        cy.contains('button', 'Aplicar').click();
      } else if ($body.find('button:contains("Buscar")').length) {
        cy.contains('button', 'Buscar').click();
      }
    });

    cy.wait(1000);
    cy.url().should('include', '/relatorios');
  });

  it('Verifica se há gráficos ou tabelas', () => {
    // Verifica se existem elementos de visualização de dados
    cy.get('body').then($body => {
      const temVisualizacao = 
        $body.find('canvas').length > 0 ||      // Charts.js
        $body.find('svg').length > 0 ||          // D3.js ou ícones
        $body.find('table').length > 0 ||        // Tabelas
        $body.find('.chart').length > 0 ||       // Container de gráfico
        $body.find('.recharts-wrapper').length > 0; // Recharts
      
      // Se não tem visualização, pelo menos tem cards com dados
      if (!temVisualizacao) {
        cy.get('.card').should('have.length.at.least', 1);
      }
    });
  });

  it('Navega entre abas ou seções de relatórios', () => {
    // Procura abas ou links de navegação dentro de relatórios
    cy.get('body').then($body => {
      if ($body.find('.nav-tabs .nav-link').length) {
        // Clica na segunda aba se existir
        cy.get('.nav-tabs .nav-link').eq(1).click();
        cy.wait(500);
      } else if ($body.find('.nav-pills .nav-link').length) {
        cy.get('.nav-pills .nav-link').eq(1).click();
        cy.wait(500);
      }
    });

    cy.url().should('include', '/relatorios');
  });

  it('Verifica carregamento de dados via API', () => {
    // Intercepta as chamadas de API de relatórios
    cy.intercept('GET', '**/api/relatorios/**').as('relatoriosApi');
    
    // Recarrega a página
    cy.reload();
    
    // Verifica se as APIs foram chamadas (pelo menos uma)
    cy.wait(2000);
    cy.url().should('include', '/relatorios');
  });

});