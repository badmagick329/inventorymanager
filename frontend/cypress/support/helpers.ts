import {
  APP_ITEMS,
  NEXT_ORDER_DETAIL,
  NEXT_ORDERS,
  NEXT_SALES,
} from '../../src/consts/urls';

export function addItem(
  name: string,
  quantity: number,
  cost: number,
  sale: number
) {
  cy.intercept('POST', `${NEXT_ORDERS}/*`).as('createItem');
  assertOrderLinkAbsent(name);
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
  cy.wait('@createItem').its('response.statusCode').should('eq', 200);
  waitForOrderFormToClose();
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
  assertOrderLinkAbsent(name);
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
  replaceInputValue('items-order-name-input', name, newName);
  replaceInputValue(
    'items-order-quantity-input',
    quantity.toString(),
    newQuantity.toString()
  );
  replaceInputValue(
    'items-order-cost-input',
    cost.toString(),
    newCost.toString()
  );
  replaceInputValue(
    'items-order-sale-input',
    sale.toString(),
    newSale.toString()
  );
  cy.intercept('PATCH', `${NEXT_ORDER_DETAIL}/*`).as('editItem');
  cy.dataCy('update-button').should('exist').click();
  cy.wait('@editItem').its('response.statusCode').should('eq', 200);
  waitForOrderFormToClose();
  cy.dataCy('items-order-link')
    .contains(newName)
    .should('exist')
    .closest('[data-testid="items-table-row"]')
    .find('[data-testid="items-order-quantity"]')
    .should('exist')
    .contains(newQuantity);
}

export function forItemClick(name: string, target: string) {
  waitForOrderFormToClose();

  openRowActions();

  cy.get('body').then(($body) => {
    const hasVisibleTarget = $body.find(`${target}:visible`).length > 0;
    if (!hasVisibleTarget) {
      openRowActions();
    }
  });

  cy.get(target, { timeout: 10000 })
    .filter(':visible')
    .should('have.length.at.least', 1)
    .first()
    .click({ force: true });

  function openRowActions() {
    cy.contains('[data-testid="items-order-link"]', name)
      .should('exist')
      .closest('[data-testid="items-table-row"]')
      .scrollIntoView();

    cy.contains('[data-testid="items-order-link"]', name)
      .should('exist')
      .closest('[data-testid="items-table-row"]')
      .find('[data-testid="items-actions-button"]')
      .first()
      .scrollIntoView()
      .click({ force: true });
  }
}

export function deleteItemViaApi(name: string) {
  cy.location('pathname').then((pathname) => {
    const locationId = pathname.split('/')[3];
    cy.request(`/fetch/orders/${locationId}`).then(({ body }) => {
      const order = body.find(
        (entry: { id: number; name: string }) => entry.name === name
      );
      expect(order, `order named ${name}`).to.exist;
      cy.request({
        method: 'DELETE',
        url: `${NEXT_ORDER_DETAIL}/${order.id}`,
      })
        .its('status')
        .should('eq', 204);
    });
  });
}

export function forSaleClick(vendorName: string, target: string) {
  const getSaleAction = ($body: JQuery<HTMLElement>) => {
    const vendor = $body
      .find('[data-testid="sales-vendor"]')
      .filter((_, element) => element.textContent?.includes(vendorName));
    return vendor
      .closest('[data-testid="sales-table-row"]')
      .find(target)
      .first();
  };

  cy.get('body').then(($body) => {
    const action = getSaleAction($body);
    expect(action).to.have.length(1);
    return cy.wrap(action).scrollIntoView();
  });

  cy.get('body').then(($body) => {
    const action = getSaleAction($body);
    expect(action).to.have.length(1);
    (action[0] as HTMLButtonElement).click();
  });
}

export function addSale(
  itemName: string,
  vendor: string,
  quantity: number,
  salePrice: number,
  amountPaid: number
) {
  forItemClick(itemName, '[data-testid="items-view-sales-button"]');
  waitForSalesPageReady();
  cy.dataCy('sales-add-sale-button').should('exist').click();
  cy.dataCy('sales-form-title').should('exist');
  cy.dataCy('sales-form-help-button').should('exist');
  cy.intercept('POST', `${NEXT_SALES}/*`).as('createSale');
  cy.dataCy('sale-vendor-input').type(vendor).blur();
  cy.contains('New Vendor').should('exist');
  cy.dataCy('sale-quantity-input').type(quantity.toString());
  cy.dataCy('sale-price-input').clear().type(salePrice.toString());
  cy.dataCy('sale-amount-paid-input').type(amountPaid.toString());
  cy.dataCy('create-button').should('exist').click();
  cy.wait('@createSale').then((interception) => {
    expect(interception.response?.statusCode).to.eq(200);
    expect(interception.request.body.vendor).to.eq(vendor);
  });
  waitForSaleFormToClose();
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

export function waitForSalesPageReady() {
  cy.url().should('include', APP_ITEMS);
  cy.contains('Loading').should('not.exist');
  cy.get('[data-testid="sales-vendors-card-title"]', { timeout: 15000 }).should(
    'exist'
  );
}

function waitForOrderFormToClose() {
  cy.get('body').should(($body) => {
    const openOrderFormCount = $body.find(
      '[data-testid="items-order-name-input"]'
    ).length;
    expect(openOrderFormCount).to.eq(0);
  });
}

function waitForSaleFormToClose() {
  cy.get('body').should(($body) => {
    const openSaleFormCount = $body.find(
      '[data-testid="sales-form-title"]'
    ).length;
    expect(openSaleFormCount).to.eq(0);
  });
}

function replaceInputValue(
  testId: string,
  initialValue: string,
  newValue: string
) {
  cy.dataCy(testId)
    .should('exist')
    .should('have.value', initialValue)
    .click({ force: true })
    .type('{selectall}{backspace}', { force: true })
    .should('have.value', '')
    .type(newValue, { force: true })
    .should('have.value', newValue);
}

function assertOrderLinkAbsent(name: string) {
  cy.get('body').should(($body) => {
    const matching = $body
      .find('[data-testid="items-order-link"]')
      .toArray()
      .filter((el) => {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return text.includes(name);
      });
    expect(matching.length).to.eq(0);
  });
}
