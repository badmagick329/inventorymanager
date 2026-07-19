import {
  APP_ITEMS,
  APP_LOCATIONS,
  NEXT_ORDER_DETAIL,
  NEXT_SALE_DETAIL,
  NEXT_SALES,
} from '../../src/consts/urls';
import {
  addItem,
  addSale,
  deleteItemViaApi,
  forItemClick,
  forSaleClick,
  waitForSalesPageReady,
} from '../support/helpers';
import { createTestName } from '../support/test-data';

describe('inventory integrity', () => {
  beforeEach(() => {
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
  });

  it('allows the final available item to be sold', () => {
    const itemName = createTestName('Final Stock Item');
    const vendorName = createTestName('Final Stock Vendor');
    addItem(itemName, 10, 100, 150);
    addSale(itemName, vendorName, 10, 150, 1500);
    cy.dataCy('sales-add-sale-button').should('be.disabled');

    deleteSale(vendorName);
    returnToItems();
    deleteItemViaApi(itemName);
  });

  it('rejects a sale larger than the remaining stock', () => {
    const itemName = createTestName('Stock Item');
    const firstVendor = createTestName('Stock Vendor');
    const secondVendor = createTestName('Overstock Vendor');
    addItem(itemName, 10, 100, 150);
    addSale(itemName, firstVendor, 9, 150, 1350);

    cy.dataCy('sales-add-sale-button').click();
    cy.intercept('POST', `${NEXT_SALES}/*`).as('oversell');
    cy.dataCy('sale-vendor-input').type(secondVendor).blur();
    cy.dataCy('sale-quantity-input').type('2');
    cy.dataCy('sale-price-input').clear().type('150');
    cy.dataCy('sale-amount-paid-input').type('150');
    cy.dataCy('create-button').click();
    cy.wait('@oversell').its('response.statusCode').should('eq', 400);
    cy.contains('Sale quantity cannot exceed the remaining stock.').should(
      'exist'
    );
    cy.dataCy('sales-form-title').should('exist');
    cy.dataCy('cancel-button').click();

    deleteSale(firstVendor);
    returnToItems();
    deleteItemViaApi(itemName);
  });

  it('rejects reducing an order below its sold quantity', () => {
    const itemName = createTestName('Order Stock Item');
    const vendorName = createTestName('Order Stock Vendor');
    addItem(itemName, 10, 100, 150);
    addSale(itemName, vendorName, 6, 150, 900);
    returnToItems();

    forItemClick(itemName, '[data-testid="items-edit-button"]');
    cy.dataCy('items-order-quantity-input').clear().type('5');
    cy.intercept('PATCH', `${NEXT_ORDER_DETAIL}/*`).as('reduceOrder');
    cy.dataCy('update-button').click();
    cy.wait('@reduceOrder').its('response.statusCode').should('eq', 400);
    cy.contains(
      'Quantity cannot be less than the number of items already sold.'
    ).should('exist');
    cy.dataCy('cancel-button').click();

    forItemClick(itemName, '[data-testid="items-view-sales-button"]');
    waitForSalesPageReady();
    deleteSale(vendorName);
    returnToItems();
    deleteItemViaApi(itemName);
  });

  it('edits a sale without exceeding available stock', () => {
    const itemName = createTestName('Editable Sale Item');
    const vendorName = createTestName('Editable Sale Vendor');
    addItem(itemName, 10, 100, 150);
    addSale(itemName, vendorName, 4, 150, 600);

    forSaleClick(vendorName, '[data-testid="sales-edit-button"]');
    cy.dataCy('sales-form-title').contains('Edit Sale');
    cy.dataCy('sale-quantity-input').clear().type('6');
    cy.intercept('PATCH', `${NEXT_SALE_DETAIL}/*`).as('editSale');
    cy.dataCy('update-button').click();
    cy.wait('@editSale').its('response.statusCode').should('eq', 200);
    cy.contains('[data-testid="sales-vendor"]', vendorName)
      .closest('[data-testid="sales-table-row"]')
      .find('[data-testid="sales-quantity"]')
      .should('contain', '6');

    deleteSale(vendorName);
    returnToItems();
    deleteItemViaApi(itemName);
  });
});

function deleteSale(vendorName: string) {
  cy.intercept('DELETE', `${NEXT_SALE_DETAIL}/*`).as('deleteSale');
  forSaleClick(vendorName, '[data-testid="sales-delete-button"]');
  cy.dataCy('delete-confirm-button').click();
  cy.wait('@deleteSale').its('response.statusCode').should('eq', 204);
}

function returnToItems() {
  cy.dataCy('sales-back-to-items-button').click();
  cy.url().should('include', APP_ITEMS);
}
