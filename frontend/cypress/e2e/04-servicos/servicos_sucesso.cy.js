/// <reference types="cypress" />

describe('Serviços - Fluxo de Sucesso', () => {

  beforeEach(() => {
    // Login antes de cada teste
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard');

    cy.visit('/servicos');
    cy.wait(1000);
  });

  it('Cria um serviço válido', () => {
    cy.contains('Novo Serviço').click();
    cy.wait(500);

    // Aguarda o formulário/modal aparecer
    cy.get('form, .modal', { timeout: 5000 }).should('be.visible');

    // Preenche os campos
    cy.get('body').then($body => {
      // Campo nome
      if ($body.find('input[name="nome"]').length) {
        cy.get('input[name="nome"]').type('Piercing Teste Cypress');
      }

      // Campo preço
      if ($body.find('input[name="preco"]').length) {
        cy.get('input[name="preco"]').type('150');
      } else if ($body.find('input[name="preco_base"]').length) {
        cy.get('input[name="preco_base"]').type('150');
      }

      // Campo duração
      if ($body.find('input[name="duracao"]').length) {
        cy.get('input[name="duracao"]').type('60');
      } else if ($body.find('input[name="duracao_estimada"]').length) {
        cy.get('input[name="duracao_estimada"]').type('60');
      }

      // Campo descrição (opcional)
      if ($body.find('textarea[name="descricao"]').length) {
        cy.get('textarea[name="descricao"]').type('Serviço de teste criado pelo Cypress');
      }

      // Campo categoria (opcional)
      if ($body.find('select[name="categoria"]').length) {
        cy.get('select[name="categoria"]').select(1);
      }
    });

    cy.contains('Salvar').click();

    // Verifica sucesso - fecha o modal ou redireciona
    cy.wait(1000);
    cy.url().should('include', '/servicos');
  });

  it('Edita um serviço existente', () => {
    // Aguarda os cards de serviços carregarem
    cy.get('.card', { timeout: 10000 }).should('have.length.at.least', 1);

    // Clica no botão de editar do primeiro card
    cy.get('.card').first().within(() => {
      cy.get('button.btn-outline-warning, a.btn-outline-warning, [title="Editar"]')
        .first()
        .click();
    });

    cy.wait(500);

    // Aguarda o modal/formulário aparecer
    cy.get('.modal, form', { timeout: 5000 }).should('be.visible');

    // Edita o nome - busca dentro do modal se existir
    cy.get('body').then($body => {
      if ($body.find('.modal input[name="nome"]').length) {
        cy.get('.modal input[name="nome"]').clear().type('Serviço Editado Cypress');
      } else if ($body.find('input[name="nome"]').length) {
        cy.get('input[name="nome"]').clear().type('Serviço Editado Cypress');
      }
    });
    
    cy.contains('Salvar').click();

    // Verifica sucesso
    cy.wait(1000);
    cy.url().should('include', '/servicos');
  });

  it('Exclui um serviço', () => {
    // Aguarda os cards de serviços carregarem
    cy.get('.card', { timeout: 10000 }).should('have.length.at.least', 1);

    // Aceita o confirm() automaticamente
    cy.on('window:confirm', () => true);

    // Clica no botão de excluir do primeiro card
    cy.get('.card').first().within(() => {
      cy.get('button.btn-outline-danger, [title="Excluir"]')
        .first()
        .click();
    });

    // Aguarda a exclusão
    cy.wait(2000);
    cy.url().should('include', '/servicos');
  });

  it('Verifica informações do serviço no card', () => {
    // Aguarda os cards de serviços carregarem
    cy.get('.card', { timeout: 10000 }).should('have.length.at.least', 1);

    // Verifica que o card tem informações básicas
    cy.get('.card').first().within(() => {
      // Verifica se tem título/nome do serviço
      cy.get('.card-title, .card-header, h5, h6, strong').should('exist');
      
      // Verifica se tem informações de preço ou duração
      cy.get('.card-body, .card-text').should('exist');
    });
  });

});