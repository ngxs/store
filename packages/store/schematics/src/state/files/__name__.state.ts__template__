import { State, Selector } from '@ngxs/store';

export interface <%= classify(name) %>StateModel {
    items: string[];
}

@State<<%= classify(name) %>StateModel>({
    name: '<%= camelize(name) %>',
    defaults: {
        items: []
    }
})
export class <%= classify(name) %>State {

    @Selector()
    public static getState(state: <%= classify(name) %>StateModel) {
        return state;
    }

}
