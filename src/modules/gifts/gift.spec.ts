import { addGift, toggleReservation, addBook, getBookDetails } from './gifts';
import { State } from './types';
import { setAutoFreeze } from 'immer';

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
  gifts: [
    {
      id: 'immer_license',
      description: 'Immer license',
      image:
        'https://raw.githubusercontent.com/immerjs/immer/master/images/immer-logo.png',
      reservedBy: 2,
    },
    {
      id: 'egghead_subscription',
      description: 'Egghead.io subscription',
      image:
        'https://pbs.twimg.com/profile_images/735242324293210112/H8YfgQHP_400x400.jpg',
      reservedBy: undefined,
    },
  ],
};

describe('Reserving an unreserved gift', () => {
  const nextState = addGift(initialState, 'mug', 'coffee mug', '');

  test('added a gift to the collection', () => {
    expect(nextState.gifts.length).toBe(3);
  });

  test("didn't modify the original state", () => {
    expect(initialState.gifts.length).toBe(2);
  });
});

describe('Reserving an unreserved gift', () => {
  const nextState = toggleReservation(initialState, 'egghead_subscription');

  test('correctly stores reservedById', () => {
    expect(nextState.gifts[1].reservedBy).toBe(1);
  });

  test("didn't modify the original state", () => {
    expect(initialState.gifts[1].reservedBy).toBe(undefined);
  });

  test('does structuraly share unchanged parts of the state tree', () => {
    expect(nextState).not.toBe(initialState);
    expect(nextState.gifts[1]).not.toBe(initialState.gifts[1]);
    expect(nextState.gifts[0]).toBe(initialState.gifts[0]);
  });

  test("can't accidentally modify the produced state", () => {
    expect(() => {
      nextState.gifts[0].reservedBy = undefined;
    }).toThrowError();
  });
});

describe('Reserving an already reserved gift', () => {
  const nextState = toggleReservation(initialState, 'immer_license');

  test('preserves stored reservedBy', () => {
    expect(nextState.gifts[0].reservedBy).toBe(2);
  });

  test('no new gifts should be created', () => {
    expect(nextState.gifts[0]).toEqual(initialState.gifts[0]);
    expect(nextState.gifts[0]).toBe(initialState.gifts[0]);
    expect(nextState).toBe(initialState);
  });
});

describe('can add book async', () => {
  test('can add marh book', async () => {
    const book = await getBookDetails('0201558025');

    const nextState = addBook(initialState, book);

    expect(nextState.gifts[2].description).toBe('Concrete mathematics');
  });

  test('can add 2 book in parallel', async () => {
    const promise1 = getBookDetails('0201558025');
    const promise2 = getBookDetails('9781598560169');
    const nextState = addBook(
      addBook(initialState, await promise1),
      await promise2
    );

    expect(nextState.gifts.length).toBe(4);
  });
});
