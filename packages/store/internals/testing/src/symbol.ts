import { NgxsModuleOptions, StateClass, Store } from '@ngxs/store';
import { ModuleWithProviders } from '@angular/core';
import { TestBedStatic } from '@angular/core/testing';

export interface NgxsOptionsTesting {
  states?: StateClass[];
  ngxsOptions?: NgxsModuleOptions;
  imports?: ModuleWithProviders[];
}

export interface NgxsTesting {
  store: Store;
  getTestBed: TestBedStatic;
}
