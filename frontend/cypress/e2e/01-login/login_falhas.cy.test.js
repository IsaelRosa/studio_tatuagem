// filepath: frontend/cypress/e2e/01-login/login_falhas.cy.js
/// <reference types="cypress" />

describe('Login - Falhas esperadas', () => {
  const TIMEOUT = { timeout: 10000 };

  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Validação de campos obrigatórios', () => {
    it('Deve exibir erro ao submeter formulário com campos vazios', () => {
      cy.get('button[type="submit"]').click();

      cy.contains('Erro', TIMEOUT).should('be.visible');
    });

    it('Deve exibir erro ao submeter apenas com email preenchido', () => {
      cy.get('input[name="email"]').type('teste@email.com');
      cy.get('button[type="submit"]').click();

      cy.contains('Erro', TIMEOUT).should('be.visible');
    });

    it('Deve exibir erro ao submeter apenas com senha preenchida', () => {
      cy.get('input[name="senha"]').type('123456');
      cy.get('button[type="submit"]').click();

      cy.contains('Erro', TIMEOUT).should('be.visible');
    });
  });

  describe('Validação de credenciais', () => {
    it('Deve exibir erro ao tentar login com email inexistente', () => {
      cy.get('input[name="email"]').type('naoexiste@email.com');
      cy.get('input[name="senha"]').type('123456');
      cy.get('button[type="submit"]').click();

      cy.contains('Verifique suas credenciais', TIMEOUT).should('be.visible');
    });

    it('Deve exibir erro ao tentar login com senha incorreta', () => {
      cy.get('input[name="email"]').type('admin@admin.com');
      cy.get('input[name="senha"]').type('senha_errada');
      cy.get('button[type="submit"]').click();

      cy.contains('Erro ao fazer login', TIMEOUT).should('be.visible');
    });
  });

  describe('Validação de formato', () => {
    it('Deve exibir erro ao informar email com formato inválido', () => {
      cy.get('input[name="email"]').type('isso_nao_e_email');
      cy.get('input[name="senha"]').type('123456');
      cy.get('button[type="submit"]').click();

      cy.contains('Erro', TIMEOUT).should('be.visible');
    });

    it('Deve exibir erro ao informar email sem domínio', () => {
      cy.get('input[name="email"]').type('email@');
      cy.get('input[name="senha"]').type('123456');
      cy.get('button[type="submit"]').click();

      cy.contains('Erro', TIMEOUT).should('be.visible');
    });

    it('Deve exibir erro ao informar senha muito curta', () => {
      cy.get('input[name="email"]').type('teste@email.com');
      cy.get('input[name="senha"]').type('123');
      cy.get('button[type="submit"]').click();

      cy.contains('Erro', TIMEOUT).should('be.visible');
    });
  });

  describe('Comportamento da interface', () => {
    it('Não deve redirecionar após falha no login', () => {
      cy.get('input[name="email"]').type('naoexiste@email.com');
      cy.get('input[name="senha"]').type('123456');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/login');
    });

    it('Deve manter o email preenchido após erro de senha', () => {
      const email = 'admin@admin.com';
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="senha"]').type('senha_errada');
      cy.get('button[type="submit"]').click();

      cy.get('input[name="email"]').should('have.value', email);
    });
  });
});