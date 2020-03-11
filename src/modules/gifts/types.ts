export interface State {
  users: User[];
  currentUser: User;
  gifts: Gift[];
}

export interface Gift {
  id: string;
  description: string;
  image: string;
  reservedBy: number | undefined;
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

export interface Action {
  type: 'ADD_GIFT' | 'TOGGLE_RESERVATION' | 'ADD_BOOK' | 'RESET';
  image?: string;
  description?: string;
  id?: string;
  book?: Book;
}
