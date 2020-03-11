import {
  State,
  Gift,
  Book,
  ActionReset,
  ActionBook,
  ActionGift,
} from './types';
import produce, {
  enableAllPlugins,
  original,
  createDraft,
  finishDraft,
  Draft,
} from 'immer';
import { allUsers, getCurrentUser } from '../users/user';
import defaultGifts from './gifts.json';

enableAllPlugins();

export const giftsReducer: (
  base: State,
  action: ActionReset | ActionBook | ActionGift
) => State = produce(
  (draft: Draft<State>, action: ActionReset | ActionBook | ActionGift) => {
    switch (action.type) {
      case 'ADD_GIFT':
        const { id, description = '', image = '' } = action;
        draft.gifts.push({
          id,
          description,
          image,
          reservedBy: undefined,
        });
        break;
      case 'TOGGLE_RESERVATION':
        const gift = draft.gifts.find(gift => gift.id === action.id);
        if (gift) {
          gift.reservedBy =
            gift.reservedBy === undefined
              ? draft.currentUser.id
              : gift.reservedBy === original(draft.currentUser)?.id
              ? undefined
              : gift.reservedBy;
        }
        break;
      case 'ADD_BOOK':
        const { book } = action;
        if (book) {
          draft.gifts.push({
            id: book.identifiers?.isbn_10,
            description: book.title,
            image: book.cover?.medium,
            reservedBy: undefined,
          });
        }
        break;
      case 'RESET':
        return getInitialState();
    }
  }
);

export function getInitialState(): State {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts as Gift[],
  };
}

export const getBookDetails = async (isbn: string) => {
  const response = await fetch(
    `http://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`,
    {
      mode: 'cors',
    }
  );

  const book: Book = (await response.json())['ISBN:' + isbn];

  return book;
};
