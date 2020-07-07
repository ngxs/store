import { NgxsModule, Store } from '@ngxs/store';
import { async, TestBed } from '@angular/core/testing';
import { DictionaryState, DictionaryStateModel } from './dictionary.state';
import { DictionaryReset, SetDictionaryData } from './dictionary.actions';

const data = [
  {
    id: '323',
    departmentCode: '2392',
    departmentName: 'Main office',
    mainCuratorUserId: 'admin',
    mainCuratorName: 'Adam Gordon',
    backupCuratorUserId: 'manager',
    backupCuratorName: 'Alexander Chester'
  },
  {
    id: '322',
    departmentCode: '2999',
    departmentName: 'New York office',
    mainCuratorUserId: 'manager',
    mainCuratorName: 'Alexander Chester',
    backupCuratorUserId: 'manager',
    backupCuratorName: 'Amanda Brian'
  }
];

describe('[TEST]: Dictionary state', () => {
  let store: Store;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([DictionaryState])]
    })
      .compileComponents()
      .then();
    store = TestBed.get(Store);
  }));

  it('Should be correct dispatch and dictionary is empty', () => {
    const dictionary: DictionaryStateModel = {
      content: [],
      page: 0,
      size: 0,
      totalPages: 0,
      totalElements: 0
    };
    store.dispatch(new SetDictionaryData(dictionary));
    const actual = store.selectSnapshot(DictionaryState.getDictionaryState);
    expect(actual).toEqual(dictionary);
  });

  it('Should be state is filled DictionaryStateModel', () => {
    const dictionary: DictionaryStateModel = {
      content: data,
      page: 0,
      size: 20,
      totalPages: 2,
      totalElements: 1
    };
    store.dispatch(new SetDictionaryData(dictionary));
    const actual = store.selectSnapshot(DictionaryState.getDictionaryState);
    expect(actual).toEqual(dictionary);
  });

  it('should be reset state', function() {
    const dictionary: DictionaryStateModel = {
      content: [],
      page: 0,
      size: 0,
      totalPages: 0,
      totalElements: 0
    };
    store.dispatch(new DictionaryReset());
    const actual = store.selectSnapshot(DictionaryState.getDictionaryState);
    expect(actual).toEqual(dictionary);
  });
});
