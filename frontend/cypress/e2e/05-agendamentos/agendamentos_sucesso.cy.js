/// <reference types="cypress" />

describe('Agendamentos - Fluxo de Sucesso', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard');

    cy.visit('/agendamentos');
    cy.wait(1000);
  });

  it('Cria um agendamento válido', () => {
    cy.contains('Novo Agendamento').click();
    cy.wait(500);

    cy.get('form', { timeout: 5000 }).should('be.visible');

    cy.get('[name="cliente_id"]').select(1);
    cy.wait(300);

    cy.get('[name="tatuador_id"]').select(1);
    cy.wait(300);

    cy.get('[name="servico_id"]').select(1);

    // Data futura (10 dias a partir de hoje)
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 10);
    const dataFormatada = dataFutura.toISOString().split('T')[0];
    
    cy.get('input[name="data"]').type(dataFormatada);
    cy.get('input[name="hora_inicio"]').type('10:00');
    cy.get('input[name="hora_fim"]').type('11:00');

    cy.get('body').then($body => {
      if ($body.find('textarea[name="descricao_tatuagem"]').length) {
        cy.get('textarea[name="descricao_tatuagem"]').type('Tatuagem de teste Cypress');
      }
    });

    cy.contains('Salvar').click();

    cy.url({ timeout: 10000 }).should('include', '/agendamentos');
    cy.url().should('not.include', '/novo');
  });

  it('Filtra agendamentos por status', () => {
    // Card de filtros é o primeiro
    cy.get('.card').first().within(() => {
      cy.get('select.form-select').select('agendado');
    });

    cy.wait(500);
    cy.url().should('include', '/agendamentos');
  });

  it('Filtra agendamentos por período', () => {
    // Card de filtros
    cy.get('.card').first().within(() => {
      // Data início
      cy.get('input[type="date"]').first().clear().type('2025-11-01');
      // Data fim
      cy.get('input[type="date"]').last().clear().type('2025-12-31');
    });

    cy.wait(500);
    cy.url().should('include', '/agendamentos');
  });

  it('Limpa filtros', () => {
    cy.get('.card').first().within(() => {
      cy.contains('Limpar Filtros').click();
    });

    cy.wait(500);
    cy.url().should('include', '/agendamentos');
  });

  it('Verifica que a página de agendamentos carrega corretamente', () => {
    // Verifica que o card de filtros existe
    cy.get('.card').first().within(() => {
      cy.contains('Filtros').should('exist');
      cy.get('input[type="date"]').should('have.length', 2);
      cy.get('select.form-select').should('exist');
    });

    // Verifica botão de novo agendamento
    cy.contains('Novo Agendamento').should('exist');
  });

});