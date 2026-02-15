import { Order } from '@/types/order';

export const orders: Order[] = [
  {
    id: '2059aecb-1b1b-4701-8c7f-07d43e23abbd',
    paymentMethod: 'PIX',
    createdAt: '2025-07-09T23:29:30',
    status: 'pending',
    total: 124.69,
    products: [
      {
        id: '67dc35be-5d17-4403-a951-4038b25b383b',
        name: 'Filtro de Óleo Tecfil',
        url: 'filtro-de-oleo-tecfil',
        isFeatured: true,
        isNew: true,
        hasShipping: true,
        sku: 'PSL55',
        description:
          '<p>Filtro de óleo Tecfil PSL55 desenvolvido para garantir maior proteção ao motor contra impurezas e partículas nocivas.</p>',
        shortDescription: 'Filtro de óleo para proteção do motor',
        price: 24.99,
        allowSale: true,
        specialPrice: null,
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQndk3GXCa5rhWu6ICIa6Cg_JqQidxNjtvuNQ&s',
        ],
        attributes: [
          { id: 'c6419809-d9c2-4d4d-9c7a-5efdb8f2abdc', name: 'Marca', value: 'TECFIL' },
          { id: 'e204e613-5bd0-46c7-b294-c70b521ce31e', name: 'Referência', value: 'PSL55' },
        ],
        categories: [{ id: 'e4bb689a-1607-4ac9-a1c4-8b514fa2b65d', name: 'Motor' }],
        quantity: 1,
      },
      {
        id: 'e47efc0a-8a3a-4b4f-9d0c-f3a79b9f3542',
        name: 'Jogo de Tapetes Automotivos',
        url: 'jogo-de-tapetes-automotivos',
        isFeatured: true,
        isNew: true,
        hasShipping: true,
        sku: 'TAP1234',
        description:
          '<p>Tapetes automotivos universais em PVC, resistentes à água, fáceis de limpar e com excelente acabamento antiderrapante.</p>',
        shortDescription: 'Jogo com 4 tapetes universais',
        price: 49.9,
        allowSale: false,
        specialPrice: null,
        images: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiz9jtYYA9u1AgM7uM_cXstmkx4JiC8moW8Q&s',
        ],
        attributes: [
          {
            id: 'f652d559-d547-49b4-8011-a6fb0618586b',
            name: 'Marca',
            value: 'UNIVERSAL',
          },
          {
            id: '07176509-9254-4f11-b4f6-065c27531129',
            name: 'Referência',
            value: 'TAP1234',
          },
        ],
        categories: [{ id: '817e275f-34f3-46b2-aaa4-6ff415337823', name: 'Acessórios' }],
        quantity: 2,
      },
    ],
  },
  {
    id: '8b9fc08a-7a17-487e-b3be-2e76a6e56c3d',
    paymentMethod: 'PIX',
    createdAt: '2025-07-08T21:42:14',
    status: 'approved',
    total: 642.27,
    products: [
      {
        id: '90fbc5c1-160a-4c96-964e-76f58fd0eb37',
        name: 'Amortecedor Traseiro Oespectrum',
        url: 'amortecedor-traseiro-oespectrum',
        isFeatured: true,
        isNew: true,
        hasShipping: true,
        sku: '58614SR',
        description:
          '<p><strong>Amortecedor Traseiro OESpectrum</strong> oferece desempenho superior com <em>tecnologia avançada de controle de carga</em> para garantir conforto e estabilidade em qualquer terreno.</p><ul><li>Indicado para veículos de passeio e utilitários leves</li><li>Compatível com diversas marcas e modelos</li><li>Fabricado com materiais de alta resistência</li></ul><p>Este produto conta com <span style="color:green;font-weight:bold;">garantia de 12 meses</span> e pode ser instalado em oficinas credenciadas. Ideal para quem busca <strong>durabilidade, segurança e performance</strong>.</p>',
        shortDescription: 'Amortecedor traseiro para Peugeot e Citroën',
        price: 642.27,
        allowSale: true,
        specialPrice: null,
        images: [
          'https://images.tcdn.com.br/img/img_prod/1153789/amortecedor_traseiro_sp120_oespectrum_gas_monroe_axios_469_1_0794722aa5a8fa14cf9adb8976788385.jpg',
          'https://images.cws.digital/produtos/gg/09/22/amortecedor-traseiro-oespectrum-6472209-1541801680444.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ6x4Hcvvpx5g4AaR7I-DsD-QHvnF4f137bQ&s',
        ],
        attributes: [
          { id: '76c44ad3-3236-41cd-940d-91fa61f4821b', name: 'Marca', value: 'MONROE' },
          { id: '362f6310-9bb6-4903-94f1-7d2be2a4dbe9', name: 'Referência', value: '379020SP' },
        ],
        categories: [{ id: 'd9881e06-4b81-48ba-ba95-3c4e672d64af', name: 'Suspensão' }],
        quantity: 1,
      },
    ],
  },
];
