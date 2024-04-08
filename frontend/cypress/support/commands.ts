/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }
import { APP_ITEMS, APP_LOCATIONS } from '../../src/consts/urls';

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

Cypress.Commands.add('adminLogin', () => {
  cy.login('admin', 'test123');
});

Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-testid="${value}"]`);
});
