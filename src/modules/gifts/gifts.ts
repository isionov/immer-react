import { State, Gift } from './types';
import produce, {
  enableAllPlugins,
  original,
  createDraft,
  finishDraft,
} from 'immer';
import { allUsers, getCurrentUser } from '../users/user';
import defaultGifts from './gifts.json';

enableAllPlugins();

export const addGift = produce(
  (draft: State, id: string, description: string, image: string) => {
    draft.gifts.push({
      id,
      description,
      image,
      reservedBy: undefined,
    });
  }
);

export const toggleReservation = produce((draft: State, giftId: string) => {
  const gift = draft.gifts.find(gift => gift.id === giftId);
  if (gift) {
    gift.reservedBy =
      gift.reservedBy === undefined
        ? draft.currentUser.id
        : gift.reservedBy === original(draft.currentUser)?.id
        ? undefined
        : gift.reservedBy;
  }
});

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

  const book = (await response.json())['ISBN:' + isbn];

  return book;
};

export const addBook = produce((draft, book) => {
  if (book) {
    draft.gifts.push({
      id: book.identifiers?.isbn_10,
      description: book.title,
      image: book.cover?.medium,
      reservedBy: undefined,
    });
  }
});
