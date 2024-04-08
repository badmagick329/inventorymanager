import { APP_MANAGE_LOCATIONS, APP_MANAGE_USERS } from '../../src/consts/urls';

describe('manage users page', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('can add user', () => {
    cy.visit(APP_MANAGE_USERS);
    cy.dataCy('manage-users-title').should('exist');
    createUser('Cypress Test User', 'testpassword');
    deleteUser('Cypress Test User');
  });
});

describe('manage locations page', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('can add location', () => {
    cy.visit(APP_MANAGE_USERS);
    createUser('Cypress Test User', 'testpassword');
    cy.visit(APP_MANAGE_LOCATIONS);
    cy.dataCy('manage-locations-title').should('exist');
    cy.dataCy('card-create-button').should('exist').click();
    cy.dataCy('location-form-title').should('exist');
    createLocation('Cypress Test Location', 'Cypress Test User');
    deleteLocation('Cypress Test Location');
    cy.visit(APP_MANAGE_USERS);
    deleteUser('Cypress Test User');
  });

  it('can edit location', () => {
    cy.visit(APP_MANAGE_LOCATIONS);
    cy.dataCy('manage-locations-title').should('exist');
    cy.dataCy('card-create-button').should('exist').click();
    cy.dataCy('location-form-title').should('exist');
    createLocation('Cypress Test Location');
    editLocation('Cypress Test Location', 'Cypress Test Location Edited');
    deleteLocation('Cypress Test Location Edited');
  });
});

function createUser(username: string, password: string) {
  cy.dataCy('card-create-button').should('exist').click();
  cy.dataCy('user-form-title').should('exist');
  cy.dataCy('manage-users-username-input').type(username);
  cy.dataCy('manage-users-password-input').type(password);
  cy.dataCy('manage-users-password2-input').type(password);
  cy.dataCy('create-button').click().wait(1000);
  cy.dataCy('manage-users-user-title')
    .last()
    .should('exist')
    .contains(username);
}

function deleteUser(username: string) {
  cy.dataCy('manage-users-user-title')
    .last()
    .should('exist')
    .contains(username);
  cy.dataCy('manage-users-delete-button').last().click();
  cy.dataCy('delete-confirm-button').click().wait(1000);
  cy.dataCy('manage-users-user-title').last().should('not.contain', username);
}

function createLocation(name: string, username?: string) {
  cy.dataCy('manage-locations-location-input').type(name);
  if (username) {
    cy.dataCy('manage-locations-usernames-select').click().wait(500);
    cy.dataCy('manage-locations-usernames-option').contains(username).click();
    cy.dataCy('manage-locations-usernames-select').click().wait(500);
  }
  cy.dataCy('create-button').click().wait(1000);
  cy.dataCy('manage-locations-location-link')
    .last()
    .should('exist')
    .contains(name);
  if (username) {
    cy.dataCy('manage-locations-username').last().should('contain', username);
  }
}

function deleteLocation(name: string) {
  cy.dataCy('manage-locations-location-link')
    .last()
    .should('exist')
    .contains(name);
  cy.dataCy('manage-locations-delete-button').last().click();
  cy.dataCy('delete-confirm-button').click().wait(1000);
  cy.dataCy('manage-locations-location-link')
    .last()
    .should('not.contain', name);
}

function editLocation(name: string, newName: string) {
  cy.dataCy('manage-locations-location-link')
    .last()
    .should('exist')
    .contains(name);
  cy.dataCy('manage-locations-edit-button').last().click();
  cy.dataCy('location-form-title').should('exist');
  cy.dataCy('manage-locations-location-input')
    .should('exist')
    .should('have.value', name)
    .clear()
    .type(newName)
    .should('have.value', newName);
  cy.dataCy('update-button').click().wait(1000);
  cy.dataCy('manage-locations-location-link')
    .last()
    .should('exist')
    .contains(newName);
}
