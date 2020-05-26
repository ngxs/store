import { State } from '@ngxs/store';

@State<string[]>({
  name: 'app',
  defaults: []
})
export class AppState {}
