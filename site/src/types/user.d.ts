export type User = {
  id: string;
  name: string;
  email: string;
  document: string;
  type: 'company' | 'person';
  phone: string;
};

export type UserWithToken = User & { token: string };
