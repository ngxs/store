import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { Emittable, Emitter } from '@ngxs-labs/emitter';
import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { CounterState, Decrement, Increment } from './store/counter.state';
import { CounterEmitterState } from './store/couter-emitter.state';
import { AddAnimal, AnimalsStateModel, AnimalState } from './store/animal.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @Select(CounterState) counter$: Observable<number>;
  @Select(CounterEmitterState) counterEmitter$: Observable<number>;
  @Select(AnimalState) animal$: Observable<AnimalsStateModel>;
  @Emitter(CounterEmitterState.increment) incrementEmitter: Emittable<void>;
  @Emitter(CounterEmitterState.decrement) decrementEmitter: Emittable<void>;
  @Dispatch() increment = () => new Increment();
  @Dispatch() decrement = () => new Decrement();
  @Dispatch() addAnimal = value => new AddAnimal(value);
}
