import {
  APP_ITEMS,
  APP_LOCATIONS,
  NEXT_SALE_DETAIL,
  NEXT_SALES,
} from '../../src/consts/urls';
import {
  addItem,
  addSale,
  deleteItem,
  fillSaleAmounts,
  forItemClick,
  forSaleClick,
  openAddSaleForm,
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

    cy.dataCy('sales-table-empty').should('exist');
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

  it('keeps the sale form open when Enter is pressed in a field', () => {
    const itemName = createTestName('Cypress Test Item');
    const vendorName = createTestName('Cypress Test Vendor');
    addItem(itemName, 100, 100, 150);
    openAddSaleForm(itemName);
    cy.intercept('POST', `${NEXT_SALES}/*`).as('createSale');
    cy.dataCy('sale-vendor-input').type(vendorName).blur();
    fillSaleAmounts(20, 150, 150 * 20);

    // The vendor field is left out: Enter there picks the highlighted
    // Autocomplete option, covered by the vendor selection test.
    for (const testId of [
      'sale-quantity-input',
      'sale-price-input',
      'sale-amount-paid-input',
    ]) {
      cy.dataCy(testId).type('{enter}');
    }
    cy.dataCy('sales-form-title').should('exist');
    cy.dataCy('sale-vendor-input').should('have.value', vendorName);
    cy.dataCy('sale-quantity-input').should('have.value', '20');
    cy.dataCy('sale-price-input').should('have.value', '150');
    cy.dataCy('sale-amount-paid-input').should('have.value', '3000');

    cy.dataCy('create-button').click();
    cy.wait('@createSale').its('response.statusCode').should('eq', 200);
    // Only the Create click reached the backend; none of the Enter presses.
    cy.get('@createSale.all').should('have.length', 1);
    cy.dataCy('sales-form-title').should('not.exist');

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem(itemName);
  });

  it('selects a highlighted vendor with Enter', () => {
    const itemName = createTestName('Cypress Test Item');
    const vendorName = createTestName('Cypress Test Vendor');
    addItem(itemName, 100, 100, 150);
    addSale(itemName, vendorName, 20, 150, 150 * 20);

    cy.dataCy('sales-add-sale-button').should('exist').click();
    cy.dataCy('sales-form-title').should('exist');
    // A fresh alias: `addSale`'s own `createSale` route matches this POST too.
    cy.intercept('POST', `${NEXT_SALES}/*`).as('createSecondSale');
    cy.dataCy('sale-vendor-input').type(vendorName.slice(0, -2));
    cy.dataCy('sale-vendor-input').type('{downArrow}{enter}');
    cy.dataCy('sales-form-title').should('exist');
    cy.dataCy('sale-vendor-input').should('have.value', vendorName);
    fillSaleAmounts(10, 150, 150 * 10);
    cy.dataCy('create-button').click();
    cy.wait('@createSecondSale').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.request.body.vendor).to.eq(vendorName);
    });
    cy.get('@createSecondSale.all').should('have.length', 1);

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
    cy.dataCy('delete-confirm-button').should('be.visible').click();
    cy.wait('@deleteSale').its('response.statusCode').should('eq', 204);
    cy.contains('[data-testid="sales-vendor"]', vendorName).should('not.exist');

    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    deleteItem(itemName);
  });
});
