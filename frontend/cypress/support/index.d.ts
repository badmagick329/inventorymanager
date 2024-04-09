declare namespace Cypress {
  interface Chainable {
    login(username: string, password: string): void;
    loginWithoutSession(username: string, password: string): void;
    adminLogin(): void;
    userLogin(): void;
    userLoginWithoutSession(): void;
    adminLoginWithoutSession(): void;
    dataCy(value: string): Chainable<JQuery<HTMLElement>>;
  }
}
