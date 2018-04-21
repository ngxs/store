import { TestBed } from '@angular/core/testing';

import { Action } from '../src/action';
import { State } from '../src/state';
import { StateContext } from '../src/symbols';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { EntityBase, EntityState } from '../src/entity-base';
import { Injector } from '@angular/core';

describe('Entity', () => {
  let store: Store;

  class Project {
    id: string;
    name: string;
  }

  class AddOne {
    static readonly type = '[Project] AddProject';
    constructor(public project: Project) {}
  }

  class AddMany {
    static readonly type = '[Project] AddProjects';
    constructor(public projects: Project[]) {}
  }

  interface ProjectStateModel extends EntityState<Project> {}

  @State<ProjectStateModel>({
    name: 'projects',
    defaults: {
      ...EntityBase.defaults
    }
  })
  class ProjectState extends EntityBase<Project, ProjectStateModel> {
    // pass injector to base class so that we can get and set state
    constructor(injector: Injector) {
      super(injector);
    }

    @Action(AddOne)
    addProject(ctx: StateContext<ProjectState>, action: AddOne) {
      this.addOne(action.project);
    }

    @Action(AddMany)
    addProjects(ctx: StateContext<ProjectState>, action: AddMany) {
      this.addMany(action.projects);
    }
  }

  /**
   * Projects
   */
  const project1 = {
    id: 'myproject',
    name: 'My Project'
  };

  const project2 = {
    id: 'myproject2',
    name: 'My Project 2'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ProjectState])]
    });

    store = TestBed.get(Store);
  });

  it('should addOne', () => {
    store.dispatch(new AddOne(project1));

    const state = store.snapshot();
    expect(state.projects.ids).toEqual(['myproject']);
    expect(state.projects.entities).toEqual({ myproject: project1 });
  });

  it('should addMany', () => {
    store.dispatch(new AddMany([project1, project2]));

    const state = store.snapshot();
    expect(state.projects.ids).toEqual(['myproject', 'myproject2']);
    expect(state.projects.entities).toEqual({
      myproject: project1,
      myproject2: project2
    });
  });
});
