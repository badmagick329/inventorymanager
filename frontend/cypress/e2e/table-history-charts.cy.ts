import {
  APP_ITEMS,
  APP_LOCATIONS,
  APP_LOCATION_HISTORY,
} from '../../src/consts/urls';
import { addItem, deleteItemViaApi } from '../support/helpers';
import { createTestName } from '../support/test-data';

describe('orders table', () => {
  beforeEach(() => {
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
  });

  it('filters, sorts, paginates, and persists column visibility', () => {
    const prefix = createTestName('Table Item');
    const names = ['A', 'B', 'C', 'D', 'E', 'F'].map(
      (suffix) => `${prefix} ${suffix}`
    );
    names.forEach((name) => addItem(name, 1, 100, 150));

    cy.dataCy('table-rows-per-page').click();
    cy.dataCy('table-page-size-5').click();
    cy.dataCy('table-page-status').should('contain', 'Page 1 of 2');
    cy.dataCy('table-next-page').click();
    cy.dataCy('table-page-status').should('contain', 'Page 2 of 2');
    cy.dataCy('table-previous-page').click();

    cy.dataCy('table-filter-name').type(`${prefix} C`);
    cy.dataCy('items-table-row')
      .should('have.length', 1)
      .and('contain', `${prefix} C`);
    cy.dataCy('table-filter-name').clear();

    cy.dataCy('table-filter-name').type(prefix);
    cy.dataCy('table-sort-name').click();
    cy.contains('[role="menuitem"]', 'Desc').click();
    cy.dataCy('items-table-row').first().should('contain', `${prefix} F`);

    cy.dataCy('table-view-options').click();
    cy.contains('[role="menuitemcheckbox"]', 'stock sold').click();
    cy.contains('th', 'Stock sold').should('not.exist');
    cy.reload();
    cy.contains('th', 'Stock sold').should('not.exist');
    cy.dataCy('table-view-options').click();
    cy.contains('[role="menuitemcheckbox"]', 'stock sold').click();
    cy.contains('th', 'Stock sold').should('exist');

    names.forEach((name) => deleteItemViaApi(name));
  });
});

describe('location history and charts', () => {
  it('shows an order in history and renders its cost chart', () => {
    const itemName = createTestName('History Chart Item');
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').first().click();
    cy.url().should('include', APP_ITEMS);
    addItem(itemName, 2, 100, 150);

    cy.location('pathname').then((pathname) => {
      const locationId = pathname.split('/').pop();
      expect(locationId).to.exist;
      cy.visit(`${APP_LOCATION_HISTORY}/${locationId}`);
      cy.dataCy('location-history-page').should('exist');
      cy.dataCy('location-history-order').should('contain', itemName);
      cy.dataCy('location-history-search').type('no matching item');
      cy.dataCy('location-history-order').should('not.exist');

      cy.visit(`${APP_ITEMS}/${locationId}/charts`);
      cy.dataCy('item-cost-chart-title').should(
        'contain',
        'Highest Item Costs'
      );
      cy.get('canvas').should('exist');

      cy.visit(`${APP_ITEMS}/${locationId}`);
      deleteItemViaApi(itemName);
    });
  });
});
