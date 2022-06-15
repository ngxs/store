import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Action, NgxsModule, Select, State, StateContext, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

describe('Cannot redefine property: ɵfac (https://github.com/ngxs/store/issues/1855)', () => {
  class AddAnimal {
    static readonly type = '[Animals state] Add animal';
    constructor(public animal: string) {}
  }

  @State({
    name: 'animals',
    defaults: ['Cat']
  })
  @Injectable()
  class AnimalsState {
    @Action(AddAnimal)
    addAnimal(ctx: StateContext<string[]>, action: AddAnimal) {
      ctx.setState(state => [...state, action.animal]);
    }
  }

  @Component({ template: '' })
  class BaseComponent {}

  @Component({
    selector: 'main',
    template: ''
  })
  class MainComponent extends BaseComponent {
    @Select(AnimalsState) animals$!: Observable<string[]>;
  }

  const testSetup = () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AnimalsState])],
      declarations: [MainComponent]
    });

    const fixture = TestBed.createComponent(MainComponent);
    const store = TestBed.inject(Store);
    const recorder: string[][] = [];
    return { fixture, store, recorder };
  };

  it('should not throw an error and should select the state successfully', () => {
    // Arrange
    const { fixture, store, recorder } = testSetup();
    const subscription = fixture.componentInstance.animals$.subscribe(animals =>
      recorder.push(animals)
    );
    // Act
    store.dispatch(new AddAnimal('Elephant'));
    // Assert
    expect(recorder).toEqual([['Cat'], ['Cat', 'Elephant']]);
    subscription.unsubscribe();
  });
});
