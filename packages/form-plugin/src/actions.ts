export class UpdateFormStatus {
  static readonly type = '[Forms] Update Form Status';

  constructor(
    public payload: {
      status: string | null;
      path: string;
    }
  ) {}
}

export class UpdateFormValue {
  static readonly type = '[Forms] Update Form Value';

  constructor(public payload: { value: any; path: string; propertyPath?: string }) {}
}

export class UpdateForm {
  static readonly type = '[Forms] Update Form';

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

export class UpdateFormDirty {
  static readonly type = '[Forms] Update Form Dirty';

  constructor(public payload: { dirty: boolean | null; path: string }) {}
}

export class SetFormDirty {
  static readonly type = '[Forms] Set Form Dirty';

  constructor(public payload: string) {}
}

export class SetFormPristine {
  static readonly type = '[Forms] Set Form Pristine';

  constructor(public payload: string) {}
}

export class UpdateFormErrors {
  static readonly type = '[Forms] Update Form Errors';

  constructor(public payload: { errors: { [k: string]: string } | null; path: string }) {}
}

export class SetFormDisabled {
  static readonly type = '[Forms] Set Form Disabled';

  constructor(public payload: string) {}
}

export class SetFormEnabled {
  static readonly type = '[Forms] Set Form Enabled';

  constructor(public payload: string) {}
}

export class ResetForm {
  static readonly type = '[Forms] Reset Form';

  constructor(public payload: { path: string; value?: any }) {}
}
