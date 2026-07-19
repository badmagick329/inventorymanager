import {
  APP_ITEMS,
  APP_LOCATIONS,
  APP_MANAGE_VENDORS,
  NEXT_SALES,
  NEXT_VENDORS,
} from '../../src/consts/urls';
import {
  addItem,
  addSale,
  forItemClick,
  waitForSalesPageReady,
} from '../support/helpers';
import { createTestName } from '../support/test-data';

describe('vendor archival', () => {
  it('archives a vendor and reactivates the same vendor for a later sale', () => {
    const itemName = createTestName('Vendor Archive Item');
    const vendorName = createTestName('Vendor Archive Vendor');
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    addItem(itemName, 10, 100, 150);
    addSale(itemName, vendorName, 2, 150, 300);

    cy.dataCy('sales-back-to-items-button').click();
    cy.location('pathname').then((pathname) => {
      const locationId = pathname.split('/')[3];
      cy.visit(`${APP_MANAGE_VENDORS}/${locationId}`);
      cy.dataCy('vendor-name')
        .contains(vendorName)
        .closest('[data-testid="vendor-form"]')
        .find('[data-testid="vendor-delete-button"]')
        .click();
      cy.intercept('DELETE', `${NEXT_VENDORS}/*`).as('archiveVendor');
      cy.dataCy('delete-confirm-button').click();
      cy.wait('@archiveVendor').its('response.statusCode').should('eq', 204);
      cy.dataCy('vendor-name').should('not.contain', vendorName);

      cy.visit(`${APP_ITEMS}/${locationId}`);
      forItemClick(itemName, '[data-testid="items-view-sales-button"]');
      waitForSalesPageReady();
      cy.dataCy('sales-vendor').should('contain', vendorName);

      cy.dataCy('sales-add-sale-button').click();
      cy.intercept('POST', `${NEXT_SALES}/*`).as('reactivateVendor');
      cy.dataCy('sale-vendor-input').type(vendorName).blur();
      cy.dataCy('sale-quantity-input').type('1');
      cy.dataCy('sale-price-input').clear().type('150');
      cy.dataCy('sale-amount-paid-input').type('150');
      cy.dataCy('create-button').click();
      cy.wait('@reactivateVendor').its('response.statusCode').should('eq', 200);
      cy.dataCy('sales-form-title').should('not.exist');

      cy.visit(`${APP_MANAGE_VENDORS}/${locationId}`);
      cy.dataCy('vendor-name')
        .filter(`:contains("${vendorName}")`)
        .should('have.length', 1);
    });
  });
});
