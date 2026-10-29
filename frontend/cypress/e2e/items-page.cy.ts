import {
  APP_ITEMS,
  APP_LOCATIONS,
  NEXT_ORDERS,
} from '../../src/consts/urls';
import {
  addItem,
  deleteItem,
  editItem,
  fillItemForm,
} from '../support/helpers';
import { createTestName } from '../support/test-data';

describe('items page', () => {
  beforeEach(() => {
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
  });

  it('is visitable', () => {
    cy.dataCy('items-manage-vendors-button').should('exist');
    cy.dataCy('items-show-more-button').should('exist');
    cy.dataCy('items-add-item-button').should('exist');
    cy.get('input[placeholder="Filter by name..."]').should('exist');
  });

  it('can show more details', () => {
    cy.dataCy('items-location-card-title').should('not.exist');
    cy.dataCy('items-vendors-card-title').should('not.exist');
    cy.dataCy('items-show-more-button').should('exist').click();
    cy.dataCy('items-location-card-title').should('exist');
    cy.dataCy('items-vendors-card-title').should('exist');
  });

  it('can add an item', () => {
    const itemName = createTestName('Cypress Test Item');
    addItem(itemName, 100, 100, 150);
    deleteItem(itemName);
  });

  it('keeps the item form open when Enter is pressed in a field', () => {
    const itemName = createTestName('Cypress Test Item');
    cy.intercept('POST', `${NEXT_ORDERS}/*`).as('createItem');
    cy.dataCy('items-add-item-button').should('exist').click();
    fillItemForm(itemName, 100, 100, 150);

    for (const testId of [
      'items-order-name-input',
      'items-order-quantity-input',
      'items-order-cost-input',
      'items-order-sale-input',
    ]) {
      cy.dataCy(testId).type('{enter}');
    }
    cy.dataCy('items-order-name-input').should('have.value', itemName);
    cy.dataCy('items-order-quantity-input').should('have.value', '100');
    cy.dataCy('items-order-cost-input').should('have.value', '100');
    cy.dataCy('items-order-sale-input').should('have.value', '150');

    cy.dataCy('create-button').click();
    cy.wait('@createItem').its('response.statusCode').should('eq', 200);
    // Only the Create click reached the backend; none of the Enter presses.
    cy.get('@createItem.all').should('have.length', 1);
    cy.dataCy('items-order-name-input').should('not.exist');
    deleteItem(itemName);
  });

  it('can edit an item', () => {
    const itemName = createTestName('Cypress Test Item');
    const editedItemName = createTestName('Cypress Test Item Edited');
    addItem(itemName, 100, 100, 150);
    editItem(
      itemName,
      100,
      100,
      150,
      editedItemName,
      200,
      200,
      250
    );
    deleteItem(editedItemName);
  });
});
