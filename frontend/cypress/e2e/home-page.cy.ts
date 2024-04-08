import { APP_LOCATIONS } from '../../src/consts/urls';

describe('home page', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('has title text', () => {
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-title')
      .should('exist')
      .contains(/locations/i);
    cy.dataCy('home-locations-container').should('exist');
  });
});
