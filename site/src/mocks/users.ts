import { User } from '@/types/user';

type UserWithToken = User & { token: string };

export const users: UserWithToken[] = [
  {
    id: 'f0a4d618-bb49-4153-9736-40d5aa889239',
    document: '11785492918',
    email: 'lucas.kaiut@gmail.com',
    name: 'Lucas Kaiut',
    type: 'person',
    token: 'bHVjYXMua2FpdXRAZ21haWwuY29t',
    phone: '41997498795'
  },
];
