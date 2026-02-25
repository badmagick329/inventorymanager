import { APP_ITEMS, APP_LOCATIONS } from '../../src/consts/urls';
import { addItem, deleteItem, editItem } from '../support/helpers';
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
