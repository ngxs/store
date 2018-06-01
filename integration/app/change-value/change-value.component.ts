import { Component } from '@angular/core';
import { Dispatch, Select } from '@ngxs/store';
import { ChangeValuesState } from './change-value.state';
import { Observable } from 'rxjs/Rx';
import { ChangeValues, ChangeValuesModel } from './change-value.actions';

@Component({
  selector: 'app-change-value',
  template: `
    <div style="display:flex; align-items:center; justify-content:space-around">
      <p style="font-size:18px;">{{ (values$ | async).str}}</p>
      <button style="height:50%;" (click)="changeValues(value)">Change Value</button>
    </div>
  `
})
export class ChangeValueComponent {
  @Select(ChangeValuesState.getValues) values$: Observable<ChangeValuesModel>;

  public value: ChangeValuesModel = {
    all: {
      str: 'another string',
      num: 17
    },
    str: 'another string',
    num: 17
  };

  constructor() {}

  @Dispatch(ChangeValues)
  changeValues(value: ChangeValuesModel): void {}
}
