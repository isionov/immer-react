import {
  State,
  Gift,
  Gifts,
  Book,
  ActionReset,
  ActionBook,
  ActionGift,
  ActionApplyPatches,
} from './types';
import produce, {
  enableAllPlugins,
  original,
  createDraft,
  finishDraft,
  Draft,
  produceWithPatches,
  Patch,
  applyPatches,
} from 'immer';
import { allUsers, getCurrentUser } from '../users/user';
import defaultGifts from './gifts.json';

enableAllPlugins();

const giftsRecipe = (
  draft: State,
  action: ActionReset | ActionBook | ActionGift | ActionApplyPatches
) => {
  switch (action.type) {
    case 'ADD_GIFT':
      const { id, description = '', image = '' } = action;
      draft.gifts.id = {
        id,
        description,
        image,
        reservedBy: undefined,
      };
      break;
    case 'TOGGLE_RESERVATION':
      const gift = draft.gifts[action.id];
      if (gift) {
        gift.reservedBy =
          gift.reservedBy === undefined || gift.reservedBy === null
            ? draft.currentUser.id
            : gift.reservedBy === original(draft.currentUser)?.id
            ? undefined
            : gift.reservedBy;
      }
      break;
    case 'ADD_BOOK':
      const { book } = action;
      if (book) {
        draft.gifts[book.identifiers.isbn_10] = {
          id: book.identifiers.isbn_10,
          description: book.title,
          image: book.cover.medium,
          reservedBy: undefined,
        };
      }
      break;
    case 'RESET':
      return getInitialState();
    case 'APPLY_PATCHES':
      return applyPatches(draft, action.patches);
  }
};

export const giftsReducer: (
  base: State,
  action: ActionReset | ActionBook | ActionGift | ActionApplyPatches
) => State = produce(giftsRecipe);

export const patchGeneratingGiftsReducer: (
  base: State,
  action: ActionReset | ActionBook | ActionGift | ActionApplyPatches
) => [State, Patch[], Patch[]] = produceWithPatches(giftsRecipe);

export function getInitialState(): State {
  return {
    users: allUsers,
    currentUser: getCurrentUser(),
    gifts: defaultGifts as Gifts,
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
