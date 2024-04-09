import {
  APP_MANAGE_LOCATIONS,
  APP_MANAGE_USERS,
  NEXT_LOCATIONS,
  NEXT_USERS,
} from '../../src/consts/urls';

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

  it('cannot add user with same username', () => {
    cy.visit(APP_MANAGE_USERS);
    createUser('Cypress Test User', 'testpassword');
    createUser('Cypress Test User', 'testpassword', true);
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
    createUser('Cypress Test User 2', 'testpassword');
    cy.visit(APP_MANAGE_LOCATIONS);
    createLocation('Cypress Test Location', [
      'Cypress Test User',
      'Cypress Test User 2',
    ]);
    deleteLocation('Cypress Test Location');
    cy.visit(APP_MANAGE_USERS);
    deleteUser('Cypress Test User 2');
    deleteUser('Cypress Test User');
  });

  it('cannot add location with same name', () => {
    cy.visit(APP_MANAGE_LOCATIONS);
    createLocation('Cypress Test Location');
    createLocation('Cypress Test Location', undefined, true);
    deleteLocation('Cypress Test Location');
  });

  it('can edit location', () => {
    cy.visit(APP_MANAGE_LOCATIONS);
    cy.dataCy('manage-locations-title').should('exist');
    createLocation('Cypress Test Location');
    editLocation('Cypress Test Location', 'Cypress Test Location Edited');
    deleteLocation('Cypress Test Location Edited');
  });

  it('cannot edit location with same name', () => {
    cy.visit(APP_MANAGE_LOCATIONS);
    createLocation('Cypress Test Location');
    createLocation('Cypress Test Location Edited');
    editLocation('Cypress Test Location', 'Cypress Test Location Edited', true);
    deleteLocation('Cypress Test Location Edited');
    deleteLocation('Cypress Test Location');
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
    cy.wait(500);
    cy.dataCy('cancel-button').click();
  } else {
    cy.wait('@createUser').its('response.statusCode').should('eq', 201);
    cy.wait(500);
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
    cy.dataCy('manage-locations-usernames-select').click().wait(500);
    for (const username of usernames) {
      cy.dataCy('manage-locations-usernames-option').contains(username).click();
    }
    cy.dataCy('manage-locations-usernames-select').click().wait(500);
  }
  cy.intercept('POST', NEXT_LOCATIONS).as('createLocation');
  cy.dataCy('create-button').click();

  if (fail) {
    cy.wait('@createLocation').its('response.statusCode').should('eq', 400);
    cy.wait(500);
    cy.dataCy('cancel-button').click();
  } else {
    cy.wait('@createLocation').its('response.statusCode').should('eq', 201);
    cy.wait(500);
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
    cy.wait(500);
    cy.dataCy('cancel-button').click();
  } else {
    cy.wait('@updateLocation').its('response.statusCode').should('eq', 200);
    cy.wait(500);
    cy.dataCy('manage-locations-location-link')
      .should('exist')
      .contains(newName);
  }
}
