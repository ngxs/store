export interface MockState {
  [key: string]: any;
}

export interface DevtoolsCallStack {
  id: number;
  type: string;
  payload: any;
  state: MockState;
  newState: MockState;
  jumped: boolean;
}
