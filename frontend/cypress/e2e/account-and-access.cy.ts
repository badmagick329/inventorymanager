import {
  APP_CHANGE_PASSWORD,
  APP_ITEMS,
  APP_LOCATIONS,
  APP_MANAGE_USERS,
  NEXT_USERS_ME,
} from '../../src/consts/urls';
import { addItem, deleteItemViaApi } from '../support/helpers';
import { createTestName, getAdminCredentials } from '../support/test-data';

describe('account and access', () => {
  it('allows a user assigned to a location to manage its inventory', () => {
    const itemName = createTestName('User Inventory Item');
    cy.userLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    addItem(itemName, 5, 100, 150);
    deleteItemViaApi(itemName);
  });

  it('redirects a regular user away from direct admin URLs', () => {
    cy.userLogin();
    cy.visit(APP_MANAGE_USERS);
    cy.location('pathname').should('eq', '/');
    cy.dataCy('login-title').should('exist');
  });

  it('changes a password and allows the new password to authenticate', () => {
    const { username, password } = getAdminCredentials();
    const newPassword = `updated-${Date.now()}-password`;
    cy.adminLoginWithoutSession();
    cy.visit(APP_CHANGE_PASSWORD);
    changePassword(password, newPassword);

    cy.request('POST', '/fetch/auth/logout');
    cy.request('POST', '/fetch/auth/login', {
      username,
      password: newPassword,
    })
      .its('status')
      .should('eq', 200);
    cy.visit(APP_CHANGE_PASSWORD);
    changePassword(newPassword, password);
  });
});

function changePassword(currentPassword: string, newPassword: string) {
  cy.dataCy('change-password-current-input').type(currentPassword);
  cy.dataCy('change-password-new-input').type(newPassword);
  cy.dataCy('change-password-new2-input').type(newPassword);
  cy.intercept('PATCH', NEXT_USERS_ME).as('changePassword');
  cy.dataCy('change-password-submit').click();
  cy.wait('@changePassword').its('response.statusCode').should('eq', 200);
  cy.contains('Password updated').should('exist');
}
