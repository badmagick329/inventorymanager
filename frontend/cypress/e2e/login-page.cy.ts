import { APP_LOCATIONS } from '../../src/consts/urls';
import { getAdminCredentials } from '../support/test-data';

describe('login page', () => {
  it('has title text and can login', () => {
    const { username, password } = getAdminCredentials();
    cy.visit('/');
    cy.dataCy('login-title')
      .should('exist')
      .contains(/inventory manager/i);

    cy.dataCy('login-username').should('exist');
    cy.dataCy('login-password').should('exist');
    cy.dataCy('login-username').type(username);
    cy.dataCy('login-password').type(password);
    cy.dataCy('login-submit').click();
    cy.url().should('include', APP_LOCATIONS);
  });
});
