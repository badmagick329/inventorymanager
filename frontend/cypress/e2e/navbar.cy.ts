import {
  APP_CHANGE_PASSWORD,
  APP_ITEMS,
  APP_LOCATIONS,
  APP_MANAGE_LOCATIONS,
  APP_MANAGE_USERS,
} from '../../src/consts/urls';

describe('navbar', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('has functional buttons', () => {
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').should('exist').click();
    cy.url().should('include', APP_ITEMS);
    cy.dataCy('navbar-home').should('exist').click();
    cy.dataCy('home-locations-title')
      .should('exist')
      .contains(/locations/i);
    // dropdown doesn't exist
    cy.dataCy('navbar-dropdown-locations').should('not.exist');
    cy.dataCy('navbar-dropdown-change-password').should('not.exist');
    cy.dataCy('navbar-dropdown-logout').should('not.exist');
    cy.dataCy('navbar-dropdown-manage-locations').should('not.exist');
    cy.dataCy('navbar-dropdown-manage-users').should('not.exist');

    // locations button works
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-locations').should('exist').click();
    cy.dataCy('home-locations-button').should('exist');
    cy.location('pathname').should('eq', APP_LOCATIONS);

    // change password button works
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-change-password').should('exist').click();
    cy.dataCy('change-password-title').should('exist');
    cy.location('pathname').should('eq', APP_CHANGE_PASSWORD);

    // manage locations button works
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-manage-locations').should('exist').click();
    cy.dataCy('manage-locations-title').should('exist');
    cy.location('pathname').should('eq', APP_MANAGE_LOCATIONS);

    // manage users button works
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-manage-users').should('exist').click();
    cy.dataCy('manage-users-title').should('exist');
    cy.location('pathname').should('eq', APP_MANAGE_USERS);

    // logout button exists
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-logout').should('exist');
  });
});
