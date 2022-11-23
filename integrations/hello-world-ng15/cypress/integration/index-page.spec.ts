/// <reference types="cypress" />

import { IndexPo } from '../support/index.po';

describe('Index page', () => {
  const index = new IndexPo();

  beforeEach(() => index.navigateTo());

  it('should render application using the latest version', () => {
    // Arrange & act & assert
    // Expect that the running applicaiton was compiled
    // with the necessary Angular version!
    cy.get('app-root')
      .invoke('attr', 'ng-version')
      .should('have.string', '15');
  });

  it('should click on the button and increase the counter', () => {
    // Arrange & act & assert
    cy.get('button')
      .click()
      .click()
      .click()
      .get('p')
      .should('contain.text', 'Counter is 3');
  });
});
