declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): void;
    adminLogin(): void;
    dataCy(value: string): Chainable<JQuery<HTMLElement>>;
  }
}
