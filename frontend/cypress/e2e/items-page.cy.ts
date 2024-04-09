import {
  APP_ITEMS,
  APP_LOCATIONS,
  NEXT_ORDER_DETAIL,
} from '../../src/consts/urls';

describe('items page', () => {
  beforeEach(() => {
    cy.adminLogin();
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').click();
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

function addItem(name: string, quantity: number, cost: number, sale: number) {
  cy.dataCy('items-order-link').contains(name).should('not.exist');
  cy.dataCy('items-add-item-button').should('exist').click();
  cy.dataCy('items-order-name-input')
    .should('exist')
    .type(name)
    .should('have.value', name);
  cy.dataCy('items-order-date-input').should('exist');
  cy.dataCy('items-order-quantity-input')
    .should('exist')
    .type(quantity.toString())
    .should('have.value', quantity.toString());
  cy.dataCy('items-order-cost-input')
    .should('exist')
    .type(cost.toString())
    .should('have.value', cost.toString());
  cy.dataCy('items-order-sale-input')
    .should('exist')
    .type(sale.toString())
    .should('have.value', sale.toString());
  cy.dataCy('create-button').should('exist').click();
  cy.wait(500);
  cy.dataCy('items-order-link')
    .contains(name)
    .should('exist')
    .closest('[data-testid="items-table-row"]')
    .find('[data-testid="items-order-quantity"]')
    .should('exist')
    .contains(quantity);
}

function deleteItem(name: string) {
  cy.intercept('DELETE', `${NEXT_ORDER_DETAIL}/*`).as('deleteItem');
  cy.dataCy('items-order-link')
    .contains(name)
    .should('exist')
    .closest('[data-testid="items-table-row"]')
    .find('[data-testid="items-delete-button"]')
    .click();
  cy.dataCy('delete-confirm-button').should('exist').click();
  cy.wait('@deleteItem').its('response.statusCode').should('eq', 204);
  cy.dataCy('items-order-link').contains(name).should('not.exist');
}

function editItem(
  name: string,
  quantity: number,
  cost: number,
  sale: number,
  newName: string,
  newQuantity: number,
  newCost: number,
  newSale: number
) {
  cy.dataCy('items-order-link')
    .contains(name)
    .should('exist')
    .closest('[data-testid="items-table-row"]')
    .find('[data-testid="items-edit-button"]')
    .click();
  cy.dataCy('items-order-name-input')
    .should('exist')
    .should('have.value', name)
    .clear()
    .type(newName)
    .should('have.value', newName);
  cy.dataCy('items-order-quantity-input')
    .should('exist')
    .should('have.value', quantity.toString())
    .clear()
    .type(newQuantity.toString())
    .should('have.value', newQuantity.toString());
  cy.dataCy('items-order-cost-input')
    .should('exist')
    .should('have.value', cost.toString())
    .clear()
    .type(newCost.toString())
    .should('have.value', newCost.toString());
  cy.dataCy('items-order-sale-input')
    .should('exist')
    .should('have.value', sale.toString())
    .clear()
    .type(newSale.toString())
    .should('have.value', newSale.toString());
  cy.intercept('PATCH', `${NEXT_ORDER_DETAIL}/*`).as('editItem');
  cy.dataCy('update-button').should('exist').click();
  cy.wait('@editItem').its('response.statusCode').should('eq', 200);
  cy.wait(500);
  cy.dataCy('items-order-link')
    .contains(newName)
    .should('exist')
    .closest('[data-testid="items-table-row"]')
    .find('[data-testid="items-order-quantity"]')
    .should('exist')
    .contains(newQuantity);
}
