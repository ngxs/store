import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private counterValueFromServer = 10;

  public getValueFromServer(): Observable<number> {
    return of(this.counterValueFromServer).pipe(delay(3000));
  }
}
