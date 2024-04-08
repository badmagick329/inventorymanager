import { APP_ITEMS, APP_LOCATIONS } from '../../src/consts/urls';

describe('items page', () => {
  beforeEach(() => {
    cy.adminLogin();
  });

  it('is visitable', () => {
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-container').should('exist');
    cy.dataCy('home-locations-button').should('exist').click();
    cy.url().should('include', APP_ITEMS);

    cy.dataCy('items-manage-vendors-button').should('exist');
    cy.dataCy('items-show-more-button').should('exist');
    cy.dataCy('items-add-item-button').should('exist');
    cy.dataCy('items-table').should('exist');
  });

  it('can show more details', () => {
    cy.visit(APP_LOCATIONS);
    cy.dataCy('home-locations-button').click();
    cy.url().should('include', APP_ITEMS);

    cy.dataCy('items-location-card-title').should('not.exist');
    cy.dataCy('items-vendors-card-title').should('not.exist');
    cy.dataCy('items-show-more-button').should('exist').click();
    cy.dataCy('items-location-card-title').should('exist');
    cy.dataCy('items-vendors-card-title').should('exist');
  });

  it('can add an item', () => {
    addItem('cypress test item', 100, 100, 150);
    deleteLastItem('cypress test item');
  });

  it('can edit an item', () => {
    addItem('cypress test item', 100, 100, 150);
    editLastItem(
      'cypress test item',
      100,
      100,
      150,
      'cypress test item edited',
      200,
      200,
      250
    );
    deleteLastItem('cypress test item edited');
  });
});

function addItem(name: string, quantity: number, cost: number, sale: number) {
  cy.visit(APP_LOCATIONS);
  cy.dataCy('home-locations-button').click();
  cy.url().should('include', APP_ITEMS);

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
  cy.dataCy('items-order-link').contains(name).should('exist');
}

function deleteLastItem(name: string) {
  cy.visit(APP_LOCATIONS);
  cy.dataCy('home-locations-button').click();
  cy.url().should('include', APP_ITEMS);

  cy.dataCy('items-order-link').contains(name).should('exist');
  cy.dataCy('items-delete-button').last().should('exist').click();
  cy.dataCy('delete-confirm-button').should('exist').click();
  cy.dataCy('items-order-link').contains(name).should('not.exist');
}

function editLastItem(
  oldName: string,
  oldQuantity: number,
  oldCost: number,
  oldSale: number,
  name: string,
  quantity: number,
  cost: number,
  sale: number
) {
  cy.visit(APP_LOCATIONS);
  cy.dataCy('home-locations-button').click();
  cy.url().should('include', APP_ITEMS);

  cy.dataCy('items-order-link').contains(oldName).should('exist');
  cy.dataCy('items-edit-button').last().should('exist').click();
  cy.dataCy('items-order-name-input')
    .should('exist')
    .should('have.value', oldName)
    .clear()
    .type(name)
    .should('have.value', name);
  cy.dataCy('items-order-quantity-input')
    .should('exist')
    .should('have.value', oldQuantity.toString())
    .clear()
    .type(quantity.toString())
    .should('have.value', quantity.toString());
  cy.dataCy('items-order-cost-input')
    .should('exist')
    .should('have.value', oldCost.toString())
    .clear()
    .type(cost.toString())
    .should('have.value', cost.toString());
  cy.dataCy('items-order-sale-input')
    .should('exist')
    .should('have.value', oldSale.toString())
    .clear()
    .type(sale.toString())
    .should('have.value', sale.toString());
  cy.dataCy('update-button').should('exist').click();
  cy.dataCy('items-order-link').contains(name).should('exist');
}
