import { CallStack } from './symbols';

export class FormatActionCallStackOptions {
  action: string;
  prevState: {};
  nextState?: {};
  payload?: any;
  error?: string;
  collapsed?: boolean;
  snapshot?: any;
}

export function formatActionCallStack(options: FormatActionCallStackOptions): CallStack {
  const { action, prevState, nextState, payload, error, collapsed, snapshot } = options;

  const formattedPayload = payload
    ? [['log', '%c payload', 'color: #9E9E9E; font-weight: bold', payload]]
    : [];

  const formattedCallstack = [
    [collapsed ? 'groupCollapsed' : 'group', `action ${action} @ `],
    ...formattedPayload,
    ['log', '%c prev state', 'color: #9E9E9E; font-weight: bold', { test: prevState }]
  ];

  if (error) {
    // If error was thrown - then we have to log `next state after error`
    formattedCallstack.push([
      'log',
      '%c next state after error',
      'color: #FD8182; font-weight: bold',
      snapshot
    ]);
  }

  formattedCallstack.push(
    [
      'log',
      error ? '%c error' : '%c next state',
      `color: #${error ? 'FD8182' : '4CAF50'}; font-weight: bold`,
      error ? {} : { test: { ...prevState, ...nextState } }
    ],
    ['groupEnd']
  );

  return formattedCallstack;
}
