/// <reference types="cypress" />

describe('Server side rendering', () => {
  const listUrl = 'http://localhost:4200/list';
  const faviconUrl = 'http://localhost:4200/favicon.ico';

  it('should make sure the Express server is running', () => {
    // Arrange & act
    cy.request(listUrl)
      .its('headers')
      .then(headers => {
        // Assert
        expect(headers).to.have.property('x-powered-by');
      });
  });

  it('should serve statics and favicon.ico', () => {
    // Arrange & act & assert
    cy.request(faviconUrl)
      .its('status')
      .should('equal', 200);
  });

  it('"ngOnInit todo" should exist', () => {
    // Arrange & act & assert
    cy.request(listUrl)
      .its('body')
      .should('include', 'ngOnInit todo');
  });

  it('lifecycle hooks should exist in the correct order (root => lazy)', () => {
    // Arrange & act
    cy.request(listUrl).then(({ body }) => {
      const ngxsOnInitIndex = body.indexOf('NgxsOnInit todo');
      const ngxsAfterBootstrapIndex = body.indexOf('NgxsAfterBootstrap todo');
      const ngxsOnInitLazyIndex = body.indexOf('NgxsOnInit lazy');
      const ngxsAfterBootstrapLazyIndex = body.indexOf('NgxsAfterBootstrap lazy');
      const stringIndexes = [
        ngxsOnInitIndex,
        ngxsAfterBootstrapIndex,
        ngxsOnInitLazyIndex,
        ngxsAfterBootstrapLazyIndex
      ];

      stringIndexes.forEach((stringIndex, index) => {
        // Assert
        expect(stringIndex).to.be.greaterThan(-1);
        // If it's not the first in the array
        // every next index should more than previous
        if (index) {
          expect(stringIndex).to.be.greaterThan(stringIndexes[index - 1]);
        }
      });
    });
  });

  it('should successfully resolve list of animals', () => {
    // Arrange & act & assert
    cy.request(listUrl)
      .its('body')
      .should('include', 'animals were resolved')
      .should('include', 'zebras,pandas,lions,giraffes');
  });
});
