import { Select } from '@ngxs/store';
 
import { <%= classify(name) %>State } from './<%= dasherize(name) %>.state';
import { animal } from './animal.actions';
 
@Component({ ... })
export class <%= classify(name) %>Component {
 // Reads the name of the store from the store class
  @Select(<%= classify(name) %>State) animals$: Observable<string[]>;
}
