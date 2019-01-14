import { FormGroup } from '@angular/forms';

export const enum AvailableControlStatus {
  Disabled = 'disabled',
  Dirty = 'dirty'
}

export const enum AvailableControlMethod {
  MarkAsDirty = 'markAsDirty',
  MarkAsPristine = 'markAsPristine',
  Disable = 'disable',
  Enable = 'enable'
}

export const enum NgxsFormShapshotValueType {
  Form = 'form',
  Control = 'control'
}

export const enum AvailableStream {
  ValueChanges = 'valueChanges',
  StatusChanges = 'statusChanges'
}
