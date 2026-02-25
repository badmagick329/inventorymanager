import { APP_LOCATIONS } from '../../src/consts/urls';
import {
  getAdminCredentials,
  getUserCredentials,
} from './test-data';

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session(
    username,
    () => {
      cy.request('POST', '/fetch/auth/login', { username, password }).its(
        'status'
      ).should('eq', 200);
      cy.visit(APP_LOCATIONS);
      cy.location('pathname').should('eq', APP_LOCATIONS);
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request('/fetch/users/me').its('status').should('eq', 200);
      },
    }
  );
});

Cypress.Commands.add(
  'loginWithoutSession',
  (username: string, password: string) => {
    cy.request('POST', '/fetch/auth/login', { username, password }).its(
      'status'
    ).should('eq', 200);
    cy.visit(APP_LOCATIONS);
    cy.location('pathname').should('eq', APP_LOCATIONS);
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
