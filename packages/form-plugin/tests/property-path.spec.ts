import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormGroup, FormControl, FormArray, ReactiveFormsModule } from '@angular/forms';
import { State, NgxsModule, Store, Selector } from '@ngxs/store';

import { NgxsFormPluginModule, UpdateFormValue } from '..';

describe('UpdateFormValue.propertyPath', () => {
  interface NovelsStateModel {
    newNovelForm: {
      model: {
        novelName: string;
        authors: {
          name: string;
        }[];
      };
    };
  }

  @State<NovelsStateModel>({
    name: 'novels',
    defaults: {
      newNovelForm: {
        model: {
          novelName: 'NGXS',
          authors: []
        }
      }
    }
  })
  class NovelsState {
    @Selector()
    static model(state: NovelsStateModel) {
      return state.newNovelForm.model;
    }
  }

  // `ngxsForm` binding path
  const path = 'novels.newNovelForm';

  @Component({
    selector: 'app-new-novel-form',
    template: `
      <form [formGroup]="newNovelForm" ngxsForm="{{ path }}">
        <input class="novel-name" formControlName="novelName" />

        <div
          class="authors"
          formArrayName="authors"
          *ngFor="let author of newNovelForm.get('authors').controls; index as index"
        >
          <div [formGroupName]="index">
            <input class="author-name" formControlName="name" />
          </div>
        </div>
      </form>
    `
  })
  class NewNovelFormComponent {
    path = path;

    newNovelForm = new FormGroup({
      novelName: new FormControl(),
      authors: new FormArray([
        this.createGroup('Mark'),
        this.createGroup('Artur'),
        this.createGroup('Max')
      ])
    });

    private createGroup(name: string) {
      return new FormGroup({
        name: new FormControl(name)
      });
    }
  }

  const getStore = (): Store => TestBed.get<Store>(Store);
  const createComponent = () => TestBed.createComponent(NewNovelFormComponent);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        NgxsModule.forRoot([NovelsState]),
        NgxsFormPluginModule.forRoot()
      ],
      declarations: [NewNovelFormComponent]
    });
  });

  it('should create form and synchronize FormArray correctly', () => {
    // Arrange
    const store = getStore();
    const fixture = createComponent();
    fixture.detectChanges();

    // Act
    const model = store.selectSnapshot(NovelsState.model);
    const novelName = fixture.debugElement.query(By.css('input.novel-name'));
    const authors = fixture.debugElement.queryAll(By.css('.authors'));
    const inputs = authors.map(author => author.query(By.css('input.author-name')));
    const values = inputs.map(input => input.nativeElement.value);

    // Assert
    expect(novelName.nativeElement.value).toEqual('NGXS');
    expect(authors.length).toEqual(3);
    expect(inputs.length).toEqual(3);
    expect(values).toEqual(['Mark', 'Artur', 'Max']);
    expect(model).toEqual({
      novelName: 'NGXS',
      authors: [
        {
          name: 'Mark'
        },
        {
          name: 'Artur'
        },
        {
          name: 'Max'
        }
      ]
    });
  });

  it('should update model and form if the UpdateFormValue action is dispatched', () => {
    // Arrange
    const store = getStore();
    const fixture = createComponent();
    fixture.detectChanges();

    // Act
    store.dispatch(
      new UpdateFormValue({
        path,
        value: {
          name: 'Mark Whitfeld'
        },
        propertyPath: 'authors.0'
      })
    );

    const model = store.selectSnapshot(NovelsState.model);
    const authors = fixture.debugElement.queryAll(By.css('.authors'));
    const inputs = authors.map(author => author.query(By.css('input.author-name')));
    const values = inputs.map(input => input.nativeElement.value);

    // Assert
    expect(values).toEqual(['Mark Whitfeld', 'Artur', 'Max']);
    expect(model.authors).toEqual([
      {
        name: 'Mark Whitfeld'
      },
      {
        name: 'Artur'
      },
      {
        name: 'Max'
      }
    ]);
  });
});
