import { patch } from '@ngxs/store/operators';
import { upsertItem } from '../src/upsert-item';

type Item = { id: string; name?: string };
type ItemsModel = { items: Item[] };

describe('upsertItem', () => {
  it('inserts if not exists', () => {
    // Arrange
    const before: ItemsModel = { items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }] };

    // Act
    const newItem = { id: '0', name: 'joaq' };
    const after = patch<ItemsModel>({
      items: upsertItem<Item>(x => x!.id === newItem.id, newItem)
    })(before);

    // Assert
    expect(after.items).toEqual([newItem, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }]);
  });

  it('updates if exists', () => {
    // Arrange
    const before: ItemsModel = { items: [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }] };

    // Act
    const updatedItem = { id: '3', name: 'joaq' };
    const after = patch<ItemsModel>({
      items: upsertItem<Item>(x => x!.id === updatedItem.id, updatedItem)
    })(before);

    // Assert
    expect(after.items).toEqual([{ id: '1' }, { id: '2' }, updatedItem, { id: '4' }]);
  });
});
