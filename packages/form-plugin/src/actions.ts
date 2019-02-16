import { StaticAction } from '@ngxs/store';

@StaticAction()
export class UpdateFormStatus {
  static get type() {
    return '[Forms] Update Form Status';
  }
  constructor(public payload: { status: string | null; path: string }) {}
}

@StaticAction()
export class UpdateFormValue {
  static get type() {
    return '[Forms] Update Form Value';
  }
  constructor(public payload: { value: any; path: string }) {}
}

@StaticAction()
export class UpdateForm {
  static get type() {
    return '[Forms] Update Form';
  }
  constructor(
    public payload: {
      value: any;
      errors: { [k: string]: string } | null;
      dirty: boolean | null;
      status: string | null;
      path: string;
    }
  ) {}
}

@StaticAction()
export class UpdateFormDirty {
  static get type() {
    return '[Forms] Update Form Dirty';
  }
  constructor(public payload: { dirty: boolean | null; path: string }) {}
}

@StaticAction()
export class SetFormDirty {
  static get type() {
    return '[Forms] Set Form Dirty';
  }
  constructor(public payload: string) {}
}

@StaticAction()
export class SetFormPristine {
  static get type() {
    return '[Forms] Set Form Pristine';
  }
  constructor(public payload: string) {}
}

@StaticAction()
export class UpdateFormErrors {
  static get type() {
    return '[Forms] Update Form Errors';
  }
  constructor(public payload: { errors: { [k: string]: string } | null; path: string }) {}
}

@StaticAction()
export class SetFormDisabled {
  static get type() {
    return '[Forms] Set Form Disabled';
  }
  constructor(public payload: string) {}
}

@StaticAction()
export class SetFormEnabled {
  static get type() {
    return '[Forms] Set Form Enabled';
  }
  constructor(public payload: string) {}
}
