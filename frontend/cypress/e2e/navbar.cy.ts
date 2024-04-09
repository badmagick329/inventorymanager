import {
  APP_CHANGE_PASSWORD,
  APP_LOCATIONS,
  APP_MANAGE_LOCATIONS,
  APP_MANAGE_USERS,
} from '../../src/consts/urls';

describe('admin navbar', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('has functional buttons', () => {
    // home button works
    cy.visit(APP_LOCATIONS);
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

describe('user navbar', () => {
  beforeEach(() => {
    cy.userLogin();
  });

  it('has functional buttons', () => {
    // home button works
    cy.visit(APP_LOCATIONS);
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

    // change password button works
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-change-password').should('exist').click();
    cy.dataCy('change-password-title').should('exist');
    cy.location('pathname').should('eq', APP_CHANGE_PASSWORD);

    // manage locations button doesn't exist
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-manage-locations').should('not.exist');

    // manage users button works
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-manage-users').should('not.exist');

    // logout button exists
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-logout').should('exist');
  });
});

describe('logout', () => {
  it('works with user', () => {
    cy.userLoginWithoutSession();
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-logout').should('exist').click();
    cy.location('pathname').should('eq', '/');
    cy.dataCy('login-title')
      .should('exist')
      .contains(/inventory manager/i);
  });
  it('works with admin', () => {
    cy.adminLoginWithoutSession();
    cy.dataCy('navbar-logged-in-as').should('exist').click();
    cy.dataCy('navbar-dropdown-logout').should('exist').click();
    cy.location('pathname').should('eq', '/');
    cy.dataCy('login-title')
      .should('exist')
      .contains(/inventory manager/i);
  });
});
