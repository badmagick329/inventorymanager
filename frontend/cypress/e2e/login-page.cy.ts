import { APP_LOCATIONS } from '../../src/consts/urls';

describe('login page', () => {
  it('has title text and can login', () => {
    cy.visit('/');
    cy.dataCy('login-title')
      .should('exist')
      .contains(/inventory manager/i);

    cy.dataCy('login-username').should('exist');
    cy.dataCy('login-password').should('exist');
    cy.dataCy('login-username').type('admin');
    cy.dataCy('login-password').type('test123');
    cy.dataCy('login-submit').click();
    cy.url().should('include', APP_LOCATIONS);
  });
});
