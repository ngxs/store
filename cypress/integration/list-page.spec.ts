import { ListPo } from '../support/list.po';

describe('List page', () => {
  const list = new ListPo();

  beforeEach(() => list.navigateTo());

  it('should contain form with "h3" title', () => {
    cy.get('.todo-list h3')
      .first()
      .invoke('text')
      .should(text => expect(text).to.equal('Reactive Form'));
  });
});
