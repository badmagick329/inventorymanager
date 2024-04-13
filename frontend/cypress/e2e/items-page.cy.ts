import { APP_ITEMS, APP_LOCATIONS } from '../../src/consts/urls';
import { addItem, deleteItem, editItem } from '../support/helpers';

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
    cy.dataCy('items-table').should('exist');
  });

  it('can show more details', () => {
    cy.dataCy('items-location-card-title').should('not.exist');
    cy.dataCy('items-vendors-card-title').should('not.exist');
    cy.dataCy('items-show-more-button').should('exist').click();
    cy.dataCy('items-location-card-title').should('exist');
    cy.dataCy('items-vendors-card-title').should('exist');
  });

  it('can add an item', () => {
    addItem('Cypress Test Item', 100, 100, 150);
    deleteItem('Cypress Test Item');
  });

  it('can edit an item', () => {
    addItem('Cypress Test Item', 100, 100, 150);
    editItem(
      'Cypress Test Item',
      100,
      100,
      150,
      'Cypress Test Item Edited',
      200,
      200,
      250
    );
    deleteItem('Cypress Test Item Edited');
  });
});
