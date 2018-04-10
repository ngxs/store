import { State } from '@ngxs/store';
import { <%= classify(name) %>StateModel } from './<%= dasherize(name) %>.model';
 
@State<<%= classify(name) %>StateModel>({
    name: '<%= dasherize(name) %>',
    defaults: []
})
export class <%= classify(name) %>State {}
