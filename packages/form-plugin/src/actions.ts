export class UpdateFormStatus {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Update Form Status';
  }
  constructor(
    public payload: {
      status: string | null;
      path: string;
    }
  ) {}
}

export class UpdateFormValue {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Update Form Value';
  }
  constructor(public payload: { value: any; path: string; propertyPath?: string }) {}
}

export class UpdateForm {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
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

export class UpdateFormDirty {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Update Form Dirty';
  }
  constructor(public payload: { dirty: boolean | null; path: string }) {}
}

export class SetFormDirty {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Set Form Dirty';
  }
  constructor(public payload: string) {}
}

export class SetFormPristine {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Set Form Pristine';
  }
  constructor(public payload: string) {}
}

export class UpdateFormErrors {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Update Form Errors';
  }
  constructor(public payload: { errors: { [k: string]: string } | null; path: string }) {}
}

export class SetFormDisabled {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Set Form Disabled';
  }
  constructor(public payload: string) {}
}

export class SetFormEnabled {
  static get type() {
    // NOTE: Not necessary to declare the type in this way in your code. See https://github.com/ngxs/store/pull/644#issuecomment-436003138
    return '[Forms] Set Form Enabled';
  }
  constructor(public payload: string) {}
}
