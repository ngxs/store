import { TestBed } from '@angular/core/testing';
import { Action } from '../src/action';
import { State } from '../src/state';
import { StateContext } from '../src/symbols';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { EntityBase, EntityStateModel, EntityUpdate } from '../src/entity-base';

describe('Entity Base', () => {
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

  class AddAll {
    static readonly type = '[Project] AddAllProjects';
    constructor(public projects: Project[]) {}
  }

  class RemoveOne {
    static readonly type = '[Project] RemoveProject';
    constructor(public key: string) {}
  }

  class RemoveMany {
    static readonly type = '[Project] RemoveProjects';
    constructor(public keys: string[]) {}
  }

  class RemoveAll {
    static readonly type = '[Project] ResetProjects';
  }

  class UpdateOne {
    static readonly type = '[Project] UpdateProject';
    constructor(public update: EntityUpdate<Project>) {}
  }

  class UpdateMany {
    static readonly type = '[Project] UpdateProjects';
    constructor(public updates: EntityUpdate<Project>[]) {}
  }

  interface ProjectStateModel extends EntityStateModel<Project> {}

  @State<ProjectStateModel>({
    name: 'projects',
    defaults: {
      ids: [],
      entities: {}
    }
  })
  class ProjectState extends EntityBase<Project, ProjectStateModel> {
    @Action(AddOne)
    addProject(ctx: StateContext<ProjectState>, action: AddOne) {
      this.addOne(action.project);
    }

    @Action(AddMany)
    addProjects(ctx: StateContext<ProjectState>, action: AddMany) {
      this.addMany(action.projects);
    }

    @Action(AddAll)
    addAllProjects(ctx: StateContext<ProjectState>, action: AddAll) {
      this.addAll(action.projects);
    }

    @Action(RemoveOne)
    removeProject(ctx: StateContext<ProjectState>, action: RemoveOne) {
      this.removeOne(action.key);
    }

    @Action(RemoveMany)
    removeProjects(ctx: StateContext<ProjectState>, action: RemoveMany) {
      this.removeMany(action.keys);
    }

    @Action(RemoveAll)
    resetProjects(ctx: StateContext<ProjectState>, action: RemoveAll) {
      this.removeAll();
    }

    @Action(UpdateOne)
    updateProject(ctx: StateContext<ProjectState>, action: UpdateOne) {
      this.updateOne(action.update);
    }

    @Action(UpdateMany)
    updateProjects(ctx: StateContext<ProjectState>, action: UpdateMany) {
      this.updateMany(action.updates);
    }
  }

  /**
   * Projects
   */
  const project1 = {
    id: 'project1',
    name: 'Project 1'
  };

  const project2 = {
    id: 'project2',
    name: 'Project 2'
  };

  const project3 = {
    id: 'project3',
    name: 'Project 3'
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
    expect(state.projects.ids).toEqual(['project1']);
    expect(state.projects.entities).toEqual({ project1: project1 });
  });

  it('should addMany', () => {
    store.dispatch(new AddMany([project1, project2]));

    const state = store.snapshot();
    expect(state.projects.ids).toEqual(['project1', 'project2']);
    expect(state.projects.entities).toEqual({
      project1: project1,
      project2: project2
    });
  });

  it('should addAll', () => {
    // Add one, that should then be gone when we addAll
    store.dispatch(new AddOne(project1));

    store.dispatch(new AddAll([project2, project3]));

    const state = store.snapshot();
    expect(Object.keys(state)).toEqual(['projects']);
    expect(state.projects.ids).toEqual(['project2', 'project3']);
    expect(state.projects.entities).toEqual({
      project2: project2,
      project3: project3
    });
  });

  it('should addAll', () => {
    // Add one, that should then be gone when we addAll
    store.dispatch(new AddOne(project1));

    store.dispatch(new AddAll([project2, project3]));

    const state = store.snapshot();
    expect(state.projects.ids).toEqual(['project2', 'project3']);
    expect(state.projects.entities).toEqual({
      project2: project2,
      project3: project3
    });
  });

  it('should removeOne', () => {
    // Add one, that should then be gone when we addAll
    store.dispatch(new AddMany([project1, project2]));

    store.dispatch(new RemoveOne('project1'));

    const state = store.snapshot();
    expect(state.projects.ids).toEqual(['project2']);
    expect(state.projects.entities).toEqual({
      project2: project2
    });
  });

  it('should removeMany', () => {
    // Add one, that should then be gone when we addAll
    store.dispatch(new AddMany([project1, project2, project3]));

    store.dispatch(new RemoveMany(['project1', 'project2']));

    const state = store.snapshot();
    expect(state.projects.ids).toEqual(['project3']);
    expect(state.projects.entities).toEqual({
      project3: project3
    });
  });

  it('should removeAll', () => {
    // Add one, that should then be gone when we addAll
    store.dispatch(new AddMany([project1, project2, project3]));

    store.dispatch(new RemoveAll());

    const state = store.snapshot();
    expect(state.projects.ids).toEqual([]);
    expect(state.projects.entities).toEqual({});
  });

  // @todo understand why the state isn't empty at start
  it('should updateOne', () => {
    let state = store.snapshot();
    expect(state.projects.ids).toEqual([]);
    expect(state.projects.entities).toEqual({});

    // Add one, that should then be gone when we addAll
    store.dispatch(new AddMany([project1, project2]));

    store.dispatch(
      new UpdateOne({
        id: 'project1',
        changes: {
          name: 'Project 1 Change'
        }
      })
    );

    state = store.snapshot();
    expect(state.projects.entities).toEqual({
      project1: {
        id: 'project1',
        name: 'Project 1 Change'
      },
      project2: {
        id: 'project2',
        name: 'Project 2'
      }
    });
  });
});
