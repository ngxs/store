import { getStoreMetadata, State } from '@ngxs/store';

describe('[TEST]: Metadata Types', () => {
  interface BookModel {
    books: string[];
  }

  @State<BookModel>({
    name: 'books',
    defaults: {
      books: []
    }
  })
  class MyBookState {}

  it('getStoreMetadata(..)', () => {
    const meta = getStoreMetadata(MyBookState); // $ExpectType MetaDataModel<any, MyBookState>
    meta.instance; // $ExpectType NgxsStateInstance<any, MyBookState> | null
    meta.defaults; // $ExpectType any
    meta.selectFromAppState; // $ExpectType SelectFromState<any> | null
  });

  it('getStoreMetadata<T>(..)', () => {
    const meta = getStoreMetadata<BookModel>(MyBookState); // $ExpectType MetaDataModel<BookModel, any>
    meta.instance; // $ExpectType NgxsStateInstance<BookModel, any> | null
    meta.defaults; // $ExpectType BookModel
    meta.selectFromAppState; // $ExpectType SelectFromState<BookModel> | null
  });

  it('getStoreMetadata<T, U>(..)', () => {
    const meta = getStoreMetadata<BookModel, MyBookState>(MyBookState); // $ExpectType MetaDataModel<BookModel, MyBookState>
    meta.instance; // $ExpectType NgxsStateInstance<BookModel, MyBookState> | null
    meta.defaults; // $ExpectType BookModel
    meta.selectFromAppState; // $ExpectType SelectFromState<BookModel> | null
  });
});
