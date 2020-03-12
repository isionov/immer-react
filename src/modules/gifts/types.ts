import { Patch } from 'immer';

export interface State {
  users: User[];
  currentUser: User;
  gifts: Gifts;
}

export interface Gifts {
  [id: string]: Gift;
}
export interface Gift {
  id: string;
  description: string;
  image: string;
  reservedBy: number | undefined | null;
}

export interface User {
  id: number;
  name: string;
}

export interface Book {
  title: string;
  cover: {
    medium: string;
  };
  identifiers: {
    isbn_10: string;
  };
}

export interface ActionBook {
  type: 'ADD_BOOK';
  book: Book;
}

export interface ActionGift {
  type: 'ADD_GIFT' | 'TOGGLE_RESERVATION';
  image?: string;
  description?: string;
  id: string;
}

export interface ActionReset {
  type: 'RESET';
}

export interface ActionApplyPatches {
  type: 'APPLY_PATCHES';
  patches: Patch[];
}
