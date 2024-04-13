import { APP_ITEMS, APP_LOCATIONS } from '../../src/consts/urls';
import {
  addItem,
  addSale,
  deleteItem,
  forItemClick,
  forSaleClick,
} from '../support/helpers';

describe('sales page', () => {
  beforeEach(() => {
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
  });

  it('exists', () => {
    addItem('Cypress Test Item', 100, 100, 150);

    forItemClick(
      'Cypress Test Item',
      '[data-testid="items-view-sales-button"]'
    );
    cy.url().should('include', APP_ITEMS);

    cy.dataCy('sales-vendors-card-title').should('exist');
    cy.dataCy('sales-no-sales-data').should('exist');
    cy.dataCy('sales-back-to-items-button').should('exist');
    cy.dataCy('sales-add-sale-button').should('exist');

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem('Cypress Test Item');
  });

  it('can add a sale', () => {
    addItem('Cypress Test Item', 100, 100, 150);
    addSale('Cypress Test Item', 'Cypress Test Vendor', 20, 150, 150 * 20);

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem('Cypress Test Item');
  });

  it('can delete a sale', () => {
    addItem('Cypress Test Item', 100, 100, 150);
    addSale('Cypress Test Item', 'Cypress Test Vendor', 20, 150, 150 * 20);

    forSaleClick('Cypress Test Vendor', '[data-testid="sales-delete-button"]');
    cy.dataCy('delete-confirm-button').should('exist').click();
    cy.wait(500);
    cy.dataCy('sales-vendor').should('not.exist');

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem('Cypress Test Item');
  });
});
