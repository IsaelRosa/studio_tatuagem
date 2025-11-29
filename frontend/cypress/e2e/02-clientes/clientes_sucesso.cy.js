/// <reference types="cypress" />

describe('Clientes - Fluxo de Sucesso', () => {

  beforeEach(() => {
    // Login antes de cada teste
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@studio.com');
    cy.get('input[name="senha"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url({ timeout: 10000 }).should('include', '/dashboard');

    cy.visit('/clientes');
    cy.wait(1000);
  });

  it('Criar cliente válido', () => {
    cy.contains('Novo Cliente').click();
    cy.wait(500);

    // Gera dados únicos
    const cpfUnico = `${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}.${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}`;
    const emailUnico = `cliente${Date.now()}@teste.com`;

    // Preenche todos os campos obrigatórios
    cy.get('input[name="nome"]').type('João Cliente Teste');
    cy.get('input[name="cpf"]').type(cpfUnico);
    cy.get('input[name="telefone"]').type('(35) 99999-9999');
    cy.get('input[name="email"]').type(emailUnico);
    cy.get('input[name="data_nascimento"]').type('1990-05-10');
    
    // Campos adicionais que podem ser obrigatórios
    cy.get('body').then($body => {
      if ($body.find('input[name="endereco"]').length) {
        cy.get('input[name="endereco"]').type('Rua Teste, 123');
      }
      if ($body.find('input[name="cidade"]').length) {
        cy.get('input[name="cidade"]').type('Lavras');
      }
      if ($body.find('input[name="estado"]').length) {
        cy.get('input[name="estado"]').type('MG');
      }
      if ($body.find('input[name="cep"]').length) {
        cy.get('input[name="cep"]').type('37200-000');
      }
    });

    cy.contains('Salvar').click();

    // Aguarda a requisição e verifica redirecionamento
    cy.url({ timeout: 10000 }).should('include', '/clientes');
  });

  it('Editar cliente existente', () => {
    // Aguarda a tabela carregar com dados
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    
    // Clica no botão de editar
    cy.get('table tbody tr').first().within(() => {
      cy.get('a.btn-outline-warning').click();
    });

    cy.wait(500);

    // Limpa e edita o nome
    cy.get('input[name="nome"]').clear().type('Cliente Editado Cypress');
    
    cy.contains('Salvar').click();

    // Aguarda processamento e verifica redirecionamento
    cy.url({ timeout: 10000 }).should('include', '/clientes');
  });

  it('Excluir cliente', () => {
    // Aguarda a tabela carregar com dados
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    
    // Aceita o confirm() automaticamente
    cy.on('window:confirm', () => true);
    
    // Clica no botão de excluir
    cy.get('table tbody tr').first().within(() => {
      cy.get('button.btn-outline-danger').click();
    });

    // Aguarda a exclusão e verifica que continua na página de clientes
    cy.wait(2000);
    cy.url().should('include', '/clientes');
  });

  it('Visualizar detalhes do cliente', () => {
    // Aguarda a tabela carregar
    cy.get('table tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    
    // Clica no botão de visualizar
    cy.get('table tbody tr').first().within(() => {
      cy.get('a.btn-outline-info').click();
    });

    // Verifica se foi para a página de detalhes
    cy.url({ timeout: 10000 }).should('match', /\/clientes\/\d+$/);
  });

});