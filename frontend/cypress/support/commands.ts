import { APP_LOCATIONS } from '../../src/consts/urls';
import {
  getAdminCredentials,
  getUserCredentials,
} from './test-data';

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
  const { username, password } = getAdminCredentials();
  cy.login(username, password);
});

Cypress.Commands.add('userLogin', () => {
  const { username, password } = getUserCredentials();
  cy.login(username, password);
});

Cypress.Commands.add('userLoginWithoutSession', () => {
  const { username, password } = getUserCredentials();
  cy.loginWithoutSession(username, password);
});

Cypress.Commands.add('adminLoginWithoutSession', () => {
  const { username, password } = getAdminCredentials();
  cy.loginWithoutSession(username, password);
});

Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-testid="${value}"]`);
});
