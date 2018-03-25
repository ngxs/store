import { Component } from '@angular/core';

@Component({
  selector: 'app-detail',
  template: `
    <a [routerLink]="['/list']">List</a>
  `
})
export class DetailComponent {}
