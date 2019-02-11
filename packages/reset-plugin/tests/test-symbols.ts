/**
 * Test namespace for App
 */
export namespace App {
  export type Status = 'OFFLINE' | 'ONLINE';

  export interface State {
    status: Status;
  }
}

/**
 * Test namespace for Preferences
 */
export namespace Preferences {
  export interface State {
    darkmode: boolean;
    language: string;
  }
}

/**
 * Test namespace for Session
 */
export namespace Session {
  export interface State {
    lastseen: number;
  }
}

/**
 * Test namespace for ToDo
 */
export namespace ToDo {
  export interface Item {
    description: string;
    done: boolean;
  }

  export interface State {
    list: Item[];
  }
}

/**
 * Test action to add a lastseen timestamp
 */
export class SessionEnd {
  static readonly type = '[Session] End';

  constructor(public payload: number) {}
}

/**
 * Test action to add a todo item
 */
export class ToDoAdd {
  static readonly type = '[ToDo] Add';

  constructor(public payload: string) {}
}
