import {
  giftsReducer,
  getBookDetails,
  patchGeneratingGiftsReducer,
} from './gifts';
import { State, ActionBook } from './types';
import { setAutoFreeze, applyPatches } from 'immer';

export const initialState: State = {
  users: [
    {
      id: 1,
      name: 'Test user',
    },
    {
      id: 2,
      name: 'Someone else',
    },
  ],
  currentUser: {
    id: 1,
    name: 'Test user',
  },
  gifts: {
    immer_license: {
      id: 'immer_license',
      description: 'Immer license',
      image:
        'https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png',
      reservedBy: 2,
    },
    egghead_subscription: {
      id: 'egghead_subscription',
      description: 'Egghead.io subscription',
      image:
        'https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg',
      reservedBy: undefined,
    },
  },
};

describe('Adding a gift', () => {
  const nextState = giftsReducer(initialState, {
    type: 'ADD_GIFT',
    id: 'mug',
    description: 'coffee mug',
    image: '',
  });

  test('added a gift to the collection', () => {
    expect(Object.keys(nextState.gifts).length).toBe(3);
  });

  test("didn't modify the original state", () => {
    expect(Object.keys(initialState.gifts).length).toBe(2);
  });
});

describe('Reserving an unreserved gift', () => {
  const nextState = giftsReducer(initialState, {
    type: 'TOGGLE_RESERVATION',
    id: 'egghead_subscription',
  });

  test('correctly stores reservedById', () => {
    expect(nextState.gifts['egghead_subscription'].reservedBy).toBe(1);
  });

  test("didn't modify the original state", () => {
    expect(initialState.gifts['egghead_subscription'].reservedBy).toBe(
      undefined
    );
  });

  test('does structuraly share unchanged parts of the state tree', () => {
    expect(nextState).not.toBe(initialState);
    expect(nextState.gifts['egghead_subscription']).not.toBe(
      initialState.gifts['egghead_subscription']
    );
    expect(nextState.gifts['immer_license']).toBe(
      initialState.gifts['immer_license']
    );
  });

  test("can't accidentally modify the produced state", () => {
    expect(() => {
      nextState.gifts[0].reservedBy = undefined;
    }).toThrowError();
  });
});

describe('Reserving an unreserved gift with patched', () => {
  const [nextState, patches] = patchGeneratingGiftsReducer(initialState, {
    type: 'TOGGLE_RESERVATION',
    id: 'egghead_subscription',
  });

  test('correctly stores reservedById', () => {
    expect(nextState.gifts['egghead_subscription'].reservedBy).toBe(1);
  });

  test('generate the correct patches', () => {
    expect(patches).toEqual([
      {
        op: 'replace',
        path: ['gifts', 'egghead_subscription', 'reservedBy'],
        value: 1,
      },
    ]);
  });

  test('aplaying patches produces the same state - 1', () => {
    expect(applyPatches(initialState, patches)).toEqual(nextState);
  });

  test('aplaying patches produces the same state - 2', () => {
    expect(
      giftsReducer(initialState, {
        type: 'APPLY_PATCHES',
        patches,
      })
    ).toEqual(nextState);
  });
});

describe('Reserving an already reserved gift', () => {
  const nextState = giftsReducer(initialState, {
    type: 'TOGGLE_RESERVATION',
    id: 'immer_license',
  });

  test('preserves stored reservedBy', () => {
    expect(nextState.gifts['immer_license'].reservedBy).toBe(2);
  });

  test('no new gifts should be created', () => {
    expect(nextState.gifts['immer_license']).toEqual(
      initialState.gifts['immer_license']
    );
    expect(nextState.gifts['immer_license']).toBe(
      initialState.gifts['immer_license']
    );
    expect(nextState).toBe(initialState);
  });
});

describe('can add book async', () => {
  test('can add marh book', async () => {
    const book = await getBookDetails('0201558025');

    const nextState = giftsReducer(initialState, { type: 'ADD_BOOK', book });

    expect(nextState.gifts[book.identifiers.isbn_10].description).toBe(
      'Concrete mathematics'
    );
  });

  test('can add 2 book in parallel', async () => {
    const promise1 = getBookDetails('0201558025');
    const promise2 = getBookDetails('9781598560169');
    const addBook1: ActionBook = {
      type: 'ADD_BOOK',
      book: await promise1,
    };
    const addBook2: ActionBook = {
      type: 'ADD_BOOK',
      book: await promise2,
    };
    const nextState = [addBook1, addBook2].reduce(giftsReducer, initialState);

    expect(Object.keys(nextState.gifts).length).toBe(4);
  });
});
