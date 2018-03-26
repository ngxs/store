export class UpdateFormStatus {
  constructor(public payload: { status: string | null; path: string }) {}
}

export class UpdateFormValue {
  constructor(public payload: { value: any; path: string }) {}
}

export class UpdateForm {
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
  constructor(public payload: { dirty: boolean | null; path: string }) {}
}

export class SetFormDirty {
  constructor(public payload: string) {}
}

export class SetFormPristine {
  constructor(public payload: string) {}
}

export class UpdateFormErrors {
  constructor(public payload: { errors: { [k: string]: string } | null; path: string }) {}
}

export class SetFormDisabled {
  constructor(public payload: string) {}
}

export class SetFormEnabled {
  constructor(public payload: string) {}
}
