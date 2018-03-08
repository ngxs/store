import { Component } from '@angular/core';

@Component({
  selector: 'app-list',
  template: `
    <a [routerLink]="['/detail']">Detail</a>
  `,
})
export class ListComponent {}
