export abstract class BasePo {
  abstract pageUrl: string;

  navigateTo() {
    cy.visit(this.pageUrl);
  }
}
