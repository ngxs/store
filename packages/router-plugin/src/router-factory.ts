import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class RouterFactory {
  static getRouter: () => Router;

  constructor(injector: Injector) {
    // Expose only static method
    RouterFactory.getRouter = () => injector.get(Router);
  }
}
