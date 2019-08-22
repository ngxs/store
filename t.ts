import { State, Action, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';

export interface Task {
  title: string;
  dates: {
    startDate: string;
    dueDate: string;
  };
}

export interface TrelloStateModel {
  tasks: {
    [taskId: string]: Task;
  };
}

export class UpdateDueDate {
  static readonly type = '[Trello] Update due date';
  constructor(public taskId: string, public dueDate: string) {}
}

import update from 'immutability-helper';

@State<TrelloStateModel>({
  name: 'trello',
  defaults: {
    tasks: {
      '123': {
        title: 'qweqwe',
        dates: {
          startDate: '20.08.2019',
          dueDate: '31.08.2019'
        }
      }
    }
  }
})
export class TrelloState {
  @Action(UpdateDueDate)
  updateDueDate(ctx: StateContext<TrelloStateModel>, action: UpdateDueDate) {
    const state = update(ctx.getState(), {
      tasks: {
        [action.taskId]: {
          dates: {
            dueDate: {
              $set: action.dueDate
            }
          }
        }
      }
    });

    ctx.setState(state);
  }
}
