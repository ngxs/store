import { NgxsModuleOptions, Store } from '@ngxs/store';
import { ModuleWithProviders } from '@angular/core';
import { TestBedStatic } from '@angular/core/testing';
import { StateClass } from '@ngxs/store/internals';

export interface NgxsOptionsTesting {
  states?: StateClass[];
  ngxsOptions?: NgxsModuleOptions;
  imports?: ModuleWithProviders[];
  before?: () => void;
}

export interface NgxsTesting {
  store: Store;
  getTestBed: TestBedStatic;
}
