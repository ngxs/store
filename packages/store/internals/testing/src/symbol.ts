import { NgxsModuleOptions, Store } from '@ngxs/store';
import { ModuleWithProviders } from '@angular/core';
import { TestBedStatic } from '@angular/core/testing';
import { ɵStateClass } from '@ngxs/store/internals';

export interface NgxsOptionsTesting {
  states?: ɵStateClass[];
  ngxsOptions?: NgxsModuleOptions;
  imports?: ModuleWithProviders<any>[];
  before?: () => void;
}

export interface NgxsTesting {
  store: Store;
  getTestBed: TestBedStatic;
}
