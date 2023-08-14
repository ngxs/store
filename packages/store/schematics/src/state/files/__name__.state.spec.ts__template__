import { TestBed, async } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { <%= classify(name) %>State, <%= classify(name) %>StateModel } from './<%= dasherize(name) %>.state';

describe('<%= classify(name) %> state', () => {
    let store: Store;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([<%= classify(name) %>State])]
        }).compileComponents();
        store = TestBed.get(Store);
    }));

    it('should create an empty state', () => {
        const actual = store.selectSnapshot(<%= classify(name) %>State.getState);
        const expected: <%= classify(name) %>StateModel = {
            items: []
        };
        expect(actual).toEqual(expected);
    });

});
