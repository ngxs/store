import { State } from '@ngxs/store';
import { DictionaryState } from './states/dictionary/dictionary.state';
import { UserState } from './states/user/user.state';

export const DashboardStates = [DictionaryState, UserState];

@State({
  name: 'dashboardStateModule',
  children: DashboardStates
})
export class DashboardStateModule {}
