import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

@Injectable()
export class ListResolver implements Resolve<string[]> {
  async resolve(): Promise<string[]> {
    return ['zebras', 'pandas', 'lions', 'giraffes'];
  }
}
