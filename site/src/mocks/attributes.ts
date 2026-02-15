import { Attribute } from '@/types/attribute';

export const attributesByCompany: Record<string, Attribute[]> = {
  '5db168c6-240e-44f1-a0b8-0a8e3a7ab5db': [
    {
      id: 'c3348b2c-8d38-49c4-a2e8-bf6945420260',
      name: 'Marca',
      filterType: 'equal',
      options: [
        {
          id: 'afa67fb0-2f39-41b9-88e1-a8781656ace3',
          name: 'Ipiranga',
        },
        {
          id: '008c42b1-7f6e-4b6d-8bde-f74f903d701a',
          name: 'SAMPEL',
        },
      ],
    },
    {
      id: '91cf12e0-4176-4678-8b4f-783d06bb706f',
      name: 'Viscosidade',
      filterType: 'equal',
      options: [
        {
          id: '75cd2823-4680-4a76-83ff-68a8dad2ff88',
          name: '15w40',
        },
        {
          id: '12f9ce97-5798-46d4-9432-af5bfd2c6c82 ',
          name: '20w50',
        },
      ],
    },
  ],
};
