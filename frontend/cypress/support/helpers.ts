import { APP_ITEMS, NEXT_ORDER_DETAIL } from '../../src/consts/urls';

export function addItem(
  name: string,
  quantity: number,
  cost: number,
  sale: number
) {
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

export function deleteItem(name: string) {
  cy.intercept('DELETE', `${NEXT_ORDER_DETAIL}/*`).as('deleteItem');
  forItemClick(name, '[data-testid="items-delete-button"]');
  cy.dataCy('delete-confirm-button').should('exist').click();
  cy.wait('@deleteItem').its('response.statusCode').should('eq', 204);
  cy.dataCy('items-order-link').contains(name).should('not.exist');
}

export function editItem(
  name: string,
  quantity: number,
  cost: number,
  sale: number,
  newName: string,
  newQuantity: number,
  newCost: number,
  newSale: number
) {
  forItemClick(name, '[data-testid="items-edit-button"]');
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

export function forItemClick(name: string, target: string) {
  cy.dataCy('items-order-link')
    .contains(name)
    .should('exist')
    .closest('[data-testid="items-table-row"]')
    .find(target)
    .should('exist')
    .click();
}

export function forSaleClick(vendorName: string, target: string) {
  cy.dataCy('sales-vendor')
    .contains(vendorName)
    .should('exist')
    .closest('[data-testid="sales-table-row"]')
    .find(target)
    .should('exist')
    .click();
}

export function addSale(
  itemName: string,
  vendor: string,
  quantity: number,
  salePrice: number,
  amountPaid: number
) {
  forItemClick(itemName, '[data-testid="items-view-sales-button"]');
  cy.url().should('include', APP_ITEMS);
  cy.dataCy('sales-add-sale-button').should('exist').click();
  cy.dataCy('sales-form-title').should('exist');
  cy.dataCy('sales-form-help-button').should('exist');
  cy.wait(500);
  cy.dataCy('sale-vendor-input').type(vendor).blur();
  cy.wait(500);
  cy.dataCy('sale-quantity-input').type(quantity.toString());
  cy.dataCy('sale-price-input').clear().type(salePrice.toString());
  cy.dataCy('sale-amount-paid-input').type(amountPaid.toString());
  cy.dataCy('create-button').should('exist').click();
  cy.wait(500);
  cy.dataCy('sales-vendor')
    .contains(vendor)
    .should('exist')
    .closest('[data-testid="sales-table-row"]')
    .find('[data-testid="sales-quantity"]')
    .should('exist')
    .contains(quantity)
    .closest('[data-testid="sales-table-row"]')
    .find('[data-testid="sales-name"]')
    .should('exist')
    .contains(itemName);
}
