describe('Server side rendering', () => {
  const listUrl = 'http://localhost:4200/list';
  const faviconUrl = 'http://localhost:4200/favicon.ico';

  function getOrderedLifecycleHooks() {
    return [
      'NgxsOnInit todo',
      'NgxsAfterBootstrap todo',
      'NgxsOnInit lazy',
      'NgxsAfterBootstrap lazy'
    ];
  }

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
    cy.request(faviconUrl).its('status').should('equal', 200);
  });

  it('"ngOnInit todo" should exist', () => {
    // Arrange & act & assert
    cy.request(listUrl).its('body').should('include', 'ngOnInit todo');
  });

  getOrderedLifecycleHooks().forEach(hook => {
    it(`should have '${hook}' lifecycle hook output visible`, () => {
      // Arrange
      // Act
      cy.request(listUrl).its('body').should('include', hook);
    });
  });

  it('lifecycle hooks should exist in the correct order (root => lazy)', () => {
    // Arrange
    const orderedTextToFind = getOrderedLifecycleHooks();
    // Act
    cy.request(listUrl).then(({ body }) => {
      const stringIndexes = orderedTextToFind.map(text => body.indexOf(text));

      stringIndexes.forEach((stringIndex, index) => {
        // Assert
        const text = orderedTextToFind[index];
        const previousIndex = index > 0 ? stringIndexes[index - 1] : -1;
        expect(stringIndex).to.be.greaterThan(
          previousIndex,
          `'${text}' index should be greater than ${previousIndex}`
        );
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
