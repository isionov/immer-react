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
