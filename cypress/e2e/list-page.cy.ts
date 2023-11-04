describe('List page', () => {
  beforeEach(() => cy.visit('/list'));

  it('should contain form with "h3" title', () => {
    cy.get('.todo-list h3')
      .first()
      .invoke('text')
      .should(text => expect(text).to.equal('Reactive Form'));
  });
});
