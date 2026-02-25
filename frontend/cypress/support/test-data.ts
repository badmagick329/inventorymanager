export function getAdminCredentials() {
  return {
    username: Cypress.env('adminUsername') as string,
    password: Cypress.env('adminPassword') as string,
  };
}

export function getUserCredentials() {
  return {
    username: Cypress.env('userUsername') as string,
    password: Cypress.env('userPassword') as string,
  };
}

export function createTestName(prefix: string) {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return `${prefix} ${stamp}`;
}
