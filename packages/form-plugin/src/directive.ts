import { Directive, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroupDirective, FormGroup } from '@angular/forms';
import { Store, getValue } from '@ngxs/store';
import { Subject } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  mergeMap,
  finalize
} from 'rxjs/operators';
import {
  UpdateFormStatus,
  UpdateFormValue,
  UpdateFormDirty,
  UpdateFormErrors,
  UpdateForm
} from './actions';

@Directive({ selector: '[ngxsForm]' })
export class FormDirective implements OnInit, OnDestroy {
  @Input('ngxsForm') path: string;
  @Input('ngxsFormDebounce') debounce = 100;
  @Input('ngxsFormClearOnDestroy') clearDestroy = false;

  private _destroy$ = new Subject<void>();
  private _updating = false;

  constructor(
    private _store: Store,
    private _formGroupDirective: FormGroupDirective,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getStateStream(this.modelPath).subscribe(model => {
      if (this._updating || !model) {
        return;
      }

      this.form.patchValue(model);
      this._cd.markForCheck();
    });

    // On first state change, sync form model, status and dirty with state
    this._store
      .selectOnce(state => getValue(state, this.path))
      .subscribe(() => {
        this._store.dispatch([
          new UpdateFormValue({
            path: this.path,
            value: this.form.getRawValue()
          }),
          new UpdateFormStatus({
            path: this.path,
            status: this.form.status
          }),
          new UpdateFormDirty({
            path: this.path,
            dirty: this.form.dirty
          })
        ]);
      });

    this.getStateStream(this.dirtyPath).subscribe(dirty => {
      if (!this.shouldChangeFormStatus(this.form.dirty, dirty)) {
        return;
      }

      if (dirty) {
        this.form.markAsDirty();
      } else {
        this.form.markAsPristine();
      }

      this._cd.markForCheck();
    });

    this.getStateStream(this.disabledPath).subscribe(disabled => {
      if (!this.shouldChangeFormStatus(this.form.disabled, disabled)) {
        return;
      }

      if (disabled) {
        this.form.disable();
      } else {
        this.form.enable();
      }

      this._cd.markForCheck();
    });

    this._formGroupDirective
      .valueChanges!.pipe(
        debounceTime(this.debounce),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        mergeMap(() => {
          const value = this._formGroupDirective.control.getRawValue();
          this._updating = true;
          return this._store
            .dispatch([
              new UpdateFormValue({
                path: this.path,
                value
              }),
              new UpdateFormDirty({
                path: this.path,
                dirty: this._formGroupDirective.dirty
              }),
              new UpdateFormErrors({
                path: this.path,
                errors: this._formGroupDirective.errors
              })
            ])
            .pipe(finalize(() => (this._updating = false)));
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();

    this._formGroupDirective
      .statusChanges!.pipe(
        debounceTime(this.debounce),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe((status: string) => {
        this._store.dispatch(
          new UpdateFormStatus({
            status,
            path: this.path
          })
        );
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();

    if (this.clearDestroy) {
      this._store.dispatch(
        new UpdateForm({
          path: this.path,
          value: null,
          dirty: null,
          status: null,
          errors: null
        })
      );
    }
  }

  private get form(): FormGroup {
    return this._formGroupDirective.form;
  }

  private get modelPath(): string {
    return `${this.path}.model`;
  }

  private get dirtyPath(): string {
    return `${this.path}.dirty`;
  }

  private get disabledPath(): string {
    return `${this.path}.disabled`;
  }

  private shouldChangeFormStatus(formStatus: boolean, status: boolean): boolean {
    return formStatus !== status && typeof status === 'boolean';
  }

  private getStateStream(path: string) {
    return this._store.select(state => getValue(state, path)).pipe(takeUntil(this._destroy$));
  }
}
