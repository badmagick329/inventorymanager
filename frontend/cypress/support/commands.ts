import { APP_LOCATIONS } from '../../src/consts/urls';

Cypress.Commands.add('login', (username: string, password: string) => {
  const log = Cypress.log({
    name: 'login',
    displayName: 'LOGIN',
    message: [`🔐 Authenticating | ${username}`],
    autoEnd: false,
  });
  cy.session(
    username,
    () => {
      cy.visit('/');
      cy.get('[data-testid="login-username"]').type(username);
      cy.get('[data-testid="login-password"]').type(password);
      cy.get('[data-testid="login-submit"]').click();
      cy.url().should('include', APP_LOCATIONS);
    },
    {
      cacheAcrossSpecs: true,
    }
  );
});

Cypress.Commands.add(
  'loginWithoutSession',
  (username: string, password: string) => {
    cy.visit('/');
    cy.get('[data-testid="login-username"]').type(username);
    cy.get('[data-testid="login-password"]').type(password);
    cy.get('[data-testid="login-submit"]').click();
    cy.url().should('include', APP_LOCATIONS);
  }
);

Cypress.Commands.add('adminLogin', () => {
  cy.login('admin', 'test123');
});

Cypress.Commands.add('userLogin', () => {
  cy.login('TestUser', 'test123');
});

Cypress.Commands.add('userLoginWithoutSession', () => {
  cy.loginWithoutSession('TestUser', 'test123');
});

Cypress.Commands.add('adminLoginWithoutSession', () => {
  cy.loginWithoutSession('admin', 'test123');
});

Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-testid="${value}"]`);
});
