import { Payload } from '@ngxs/store';

export class ChangeValuesModel {
  constructor(
    public all = {
      str: 'I am string',
      num: 11
    },
    public str = 'I am string',
    public num = 11
  ) {}
}

@Payload(ChangeValuesModel)
export class ChangeValues {
  static readonly type = '[CV] Change';

  constructor(public payload: ChangeValuesModel) {}
}
