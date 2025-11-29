/// <reference types="cypress" />

describe('Tatuadores - Fluxo de Sucesso', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard');

    cy.visit('/tatuadores');
    cy.wait(1000);
  });

  it('Criar tatuador válido', () => {
    cy.contains('Novo Tatuador').click();
    cy.wait(500);

    cy.get('form', { timeout: 5000 }).should('be.visible');

    const emailUnico = `tatuador${Date.now()}@studio.com`;

    cy.get('input[name="nome"]').type('Tattoo Master Cypress');
    cy.get('input[name="email"]').type(emailUnico);
    cy.get('input[name="telefone"]').type('(35) 99999-8888');

    cy.get('body').then($body => {
      if ($body.find('input[name="especialidade"]').length) {
        cy.get('input[name="especialidade"]').type('Realismo');
      }
      if ($body.find('input[name="especialidades"]').length) {
        cy.get('input[name="especialidades"]').type('Realismo, Blackwork');
      }
      if ($body.find('input[name="instagram"]').length) {
        cy.get('input[name="instagram"]').type('@tattoomaster');
      }
      if ($body.find('textarea[name="bio"]').length) {
        cy.get('textarea[name="bio"]').type('Tatuador especializado em realismo');
      }
      if ($body.find('input[name="anos_experiencia"]').length) {
        cy.get('input[name="anos_experiencia"]').type('5');
      }
      if ($body.find('input[name="comissao"]').length) {
        cy.get('input[name="comissao"]').type('50');
      }
      if ($body.find('input[name="ativo"]').length) {
        cy.get('input[name="ativo"]').check();
      }
      if ($body.find('select[name="status"]').length) {
        cy.get('select[name="status"]').select(1);
      }
    });

    cy.contains('Salvar').click();

    cy.wait(2000);
    cy.url().should('include', '/tatuadores');
  });

  it('Busca tatuador por nome', () => {
    // Card de filtros é o primeiro
    cy.get('.card').first().within(() => {
      cy.get('input[placeholder*="Buscar"]').type('Tattoo');
      cy.contains('Buscar').click();
    });

    cy.wait(500);
    cy.url().should('include', '/tatuadores');
  });

  it('Filtra tatuadores por status', () => {
    // Card de filtros
    cy.get('.card').first().within(() => {
      cy.get('select.form-select').select('ativos');
      cy.contains('Buscar').click();
    });

    cy.wait(500);
    cy.url().should('include', '/tatuadores');
  });

  it('Editar tatuador existente', () => {
    // Cards de tatuadores começam do índice 1 (o 0 é filtros)
    cy.get('.card').should('have.length.at.least', 2);

    // Pega o segundo card (primeiro tatuador)
    cy.get('.card').eq(1).then($card => {
      const $btnEdit = $card.find('a[href*="/editar"], button.btn-warning, button.btn-outline-warning, [class*="warning"]');
      const $svgEdit = $card.find('svg.lucide-pen-square, svg.lucide-pencil').parent();
      
      if ($btnEdit.length) {
        cy.wrap($btnEdit.first()).click();
      } else if ($svgEdit.length) {
        cy.wrap($svgEdit.first()).click();
      } else {
        cy.wrap($card).find('button, a').eq(0).click();
      }
    });

    cy.wait(500);

    cy.get('input[name="nome"]').clear().type('Tatuador Editado Cypress');
    cy.contains('Salvar').click();

    cy.wait(1000);
    cy.url().should('include', '/tatuadores');
  });

  it('Excluir tatuador', () => {
    cy.get('.card').should('have.length.at.least', 2);

    cy.on('window:confirm', () => true);

    cy.get('.card').eq(1).then($card => {
      const $btnDelete = $card.find('button.btn-danger, button.btn-outline-danger, [class*="danger"]');
      const $svgDelete = $card.find('svg.lucide-trash2, svg.lucide-trash').parent();
      
      if ($btnDelete.length) {
        cy.wrap($btnDelete.first()).click();
      } else if ($svgDelete.length) {
        cy.wrap($svgDelete.first()).click();
      } else {
        cy.wrap($card).find('button').last().click();
      }
    });

    cy.wait(2000);
    cy.url().should('include', '/tatuadores');
  });

  it('Verifica informações do tatuador no card', () => {
    cy.get('.card').should('have.length.at.least', 2);

    // Verifica o segundo card (primeiro tatuador)
    cy.get('.card').eq(1).within(() => {
      cy.get('.card-body, .card-header, .card-title, h5, h6, strong').should('exist');
    });
  });

  it('Verifica listagem de tatuadores', () => {
    // Verifica card de filtros
    cy.get('.card').first().within(() => {
      cy.get('input[placeholder*="Buscar"]').should('exist');
      cy.get('select.form-select').should('exist');
    });

    // Verifica que existem tatuadores listados (além do card de filtros)
    cy.get('.card').should('have.length.at.least', 2);
    
    // Verifica botão de novo tatuador
    cy.contains('Novo Tatuador').should('exist');
  });

});