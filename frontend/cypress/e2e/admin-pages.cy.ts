import {
  APP_MANAGE_LOCATIONS,
  APP_MANAGE_USERS,
  NEXT_LOCATIONS,
  NEXT_USERS,
} from '../../src/consts/urls';
import { createTestName } from '../support/test-data';

describe('manage users page', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('can add user', () => {
    const username = createTestName('Cypress Test User');
    cy.visit(APP_MANAGE_USERS);
    cy.dataCy('manage-users-title').should('exist');
    createUser(username, 'testpassword');
    deleteUser(username);
  });

  it('cannot add user with same username', () => {
    const username = createTestName('Cypress Test User');
    cy.visit(APP_MANAGE_USERS);
    createUser(username, 'testpassword');
    createUser(username, 'testpassword', true);
    deleteUser(username);
  });
});

describe('manage locations page', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('can add location', () => {
    const userOne = createTestName('Cypress Test User');
    const userTwo = createTestName('Cypress Test User');
    const locationName = createTestName('Cypress Test Location');
    cy.visit(APP_MANAGE_USERS);
    createUser(userOne, 'testpassword');
    createUser(userTwo, 'testpassword');
    cy.visit(APP_MANAGE_LOCATIONS);
    createLocation(locationName, [userOne, userTwo]);
    deleteLocation(locationName);
    cy.visit(APP_MANAGE_USERS);
    deleteUser(userTwo);
    deleteUser(userOne);
  });

  it('cannot add location with same name', () => {
    const locationName = createTestName('Cypress Test Location');
    cy.visit(APP_MANAGE_LOCATIONS);
    createLocation(locationName);
    createLocation(locationName, undefined, true);
    deleteLocation(locationName);
  });

  it('can edit location', () => {
    const locationName = createTestName('Cypress Test Location');
    const editedLocationName = createTestName('Cypress Test Location Edited');
    cy.visit(APP_MANAGE_LOCATIONS);
    cy.dataCy('manage-locations-title').should('exist');
    createLocation(locationName);
    editLocation(locationName, editedLocationName);
    deleteLocation(editedLocationName);
  });

  it('cannot edit location with same name', () => {
    const locationName = createTestName('Cypress Test Location');
    const editedLocationName = createTestName('Cypress Test Location Edited');
    cy.visit(APP_MANAGE_LOCATIONS);
    createLocation(locationName);
    createLocation(editedLocationName);
    editLocation(locationName, editedLocationName, true);
    deleteLocation(editedLocationName);
    deleteLocation(locationName);
  });
});

function createUser(username: string, password: string, fail: boolean = false) {
  cy.dataCy('card-create-button').should('exist').click();
  cy.dataCy('user-form-title').should('exist');
  cy.dataCy('manage-users-username-input').type(username);
  cy.dataCy('manage-users-password-input').type(password);
  cy.dataCy('manage-users-password2-input').type(password);
  cy.intercept('POST', NEXT_USERS).as('createUser');
  cy.dataCy('create-button').click();
  if (fail) {
    cy.wait('@createUser').its('response.statusCode').should('eq', 400);
    cy.dataCy('cancel-button').click();
  } else {
    cy.wait('@createUser').its('response.statusCode').should('eq', 201);
    cy.dataCy('manage-users-user-title').should('exist').contains(username);
  }
}

function deleteUser(username: string) {
  cy.dataCy('manage-users-user-title')
    .last()
    .should('exist')
    .contains(username);
  cy.dataCy('manage-users-delete-button').last().click();
  cy.intercept('DELETE', `${NEXT_USERS}/*`).as('deleteUser');
  cy.dataCy('delete-confirm-button').click();
  cy.wait('@deleteUser').its('response.statusCode').should('eq', 204);
  cy.dataCy('manage-users-user-title').last().should('not.contain', username);
}

function createLocation(
  name: string,
  usernames?: string[],
  fail: boolean = false
) {
  cy.dataCy('card-create-button').should('exist').click();
  cy.dataCy('location-form-title').should('exist');
  cy.dataCy('manage-locations-location-input').type(name);
  if (usernames) {
    cy.dataCy('manage-locations-usernames-select').click();
    cy.dataCy('manage-locations-usernames-option').should('exist');
    for (const username of usernames) {
      cy.dataCy('manage-locations-usernames-option').contains(username).click();
    }
    cy.dataCy('manage-locations-usernames-select').click();
  }
  cy.intercept('POST', NEXT_LOCATIONS).as('createLocation');
  cy.dataCy('create-button').click();

  if (fail) {
    cy.wait('@createLocation').its('response.statusCode').should('eq', 400);
    cy.dataCy('cancel-button').click();
  } else {
    cy.wait('@createLocation').its('response.statusCode').should('eq', 201);
    cy.dataCy('manage-locations-location-link').should('exist').contains(name);
    if (usernames) {
      for (const username of usernames) {
        cy.dataCy('manage-locations-username').should('contain', username);
      }
    }
  }
}

function deleteLocation(name: string) {
  cy.dataCy('manage-locations-location-link')
    .should('exist')
    .contains(name)
    .closest('[data-testid="manage-locations-location-card"]')
    .find('[data-testid="manage-locations-delete-button"]')
    .should('exist')
    .click();
  cy.intercept('DELETE', `${NEXT_LOCATIONS}/*`).as('deleteLocation');
  cy.dataCy('delete-confirm-button').click();
  cy.wait('@deleteLocation').its('response.statusCode').should('eq', 204);
  cy.dataCy('manage-locations-location-link').should('not.contain', name);
}

function editLocation(name: string, newName: string, fail: boolean = false) {
  cy.dataCy('manage-locations-location-link')
    .should('exist')
    .contains(name)
    .closest('[data-testid="manage-locations-location-card"]')
    .find('[data-testid="manage-locations-edit-button"]')
    .should('exist')
    .click();
  cy.dataCy('location-form-title').should('exist');
  cy.dataCy('manage-locations-location-input')
    .should('exist')
    .should('have.value', name)
    .clear()
    .type(newName)
    .should('have.value', newName);
  cy.intercept('PATCH', `${NEXT_LOCATIONS}/*`).as('updateLocation');
  cy.dataCy('update-button').click();
  if (fail) {
    cy.wait('@updateLocation').its('response.statusCode').should('eq', 400);
    cy.dataCy('cancel-button').click();
  } else {
    cy.wait('@updateLocation').its('response.statusCode').should('eq', 200);
    cy.dataCy('manage-locations-location-link')
      .should('exist')
      .contains(newName);
  }
}
