import { APP_ITEMS, APP_LOCATIONS, NEXT_SALE_DETAIL } from '../../src/consts/urls';
import {
  addItem,
  addSale,
  deleteItem,
  forItemClick,
  forSaleClick,
  waitForSalesPageReady,
} from '../support/helpers';
import { createTestName } from '../support/test-data';

describe('sales page', () => {
  beforeEach(() => {
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
  });

  it('exists', () => {
    const itemName = createTestName('Cypress Test Item');
    addItem(itemName, 100, 100, 150);

    forItemClick(
      itemName,
      '[data-testid="items-view-sales-button"]'
    );
    waitForSalesPageReady();

    cy.dataCy('sales-no-sales-data').should('exist');
    cy.dataCy('sales-back-to-items-button').should('exist');
    cy.dataCy('sales-add-sale-button').should('exist');

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem(itemName);
  });

  it('can add a sale', () => {
    const itemName = createTestName('Cypress Test Item');
    const vendorName = createTestName('Cypress Test Vendor');
    addItem(itemName, 100, 100, 150);
    addSale(itemName, vendorName, 20, 150, 150 * 20);

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem(itemName);
  });

  it('can delete a sale', () => {
    const itemName = createTestName('Cypress Test Item');
    const vendorName = createTestName('Cypress Test Vendor');
    addItem(itemName, 100, 100, 150);
    addSale(itemName, vendorName, 20, 150, 150 * 20);

    cy.intercept('DELETE', `${NEXT_SALE_DETAIL}/*`).as('deleteSale');
    forSaleClick(vendorName, '[data-testid="sales-delete-button"]');
    cy.dataCy('delete-confirm-button').should('exist').click();
    cy.wait('@deleteSale').its('response.statusCode').should('eq', 204);
    cy.contains('[data-testid="sales-vendor"]', vendorName).should('not.exist');

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem(itemName);
  });
});
