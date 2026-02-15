import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: 'a1fbc5c1-160a-4c96-964e-76f58fd0aa01',
    name: 'Fone Antirruído Sensorial Infantil',
    url: 'fone-antirruido-sensorial-infantil',
    isFeatured: true,
    isNew: true,
    hasShipping: true,
    sku: 'SENS001',
    description:
      '<p><strong>Fone antirruído sensorial</strong> desenvolvido para ajudar crianças e adultos autistas a reduzir a sobrecarga sonora em ambientes barulhentos.</p><ul><li>Atenuação eficiente de ruídos</li><li>Ajustável e confortável</li><li>Ideal para escola, viagens e eventos</li></ul><p>Proporciona mais <strong>conforto, segurança e bem-estar</strong> no dia a dia.</p>',
    shortDescription: 'Fone redutor de ruído para sensibilidade auditiva',
    price: 129.9,
    allowSale: true,
    specialPrice: 109.9,
    images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRayy_Md4PfwMSXg-tfoHxXy_EljVs8rEw-uQ&s'],
    attributes: [
      { id: 'att001', name: 'Material', value: 'Espuma acústica e ABS' },
      { id: 'att002', name: 'Ajustável', value: 'Sim' },
    ],
    categories: [{ id: 'cat001', name: 'Regulação Sensorial' }],
  },
  {
    id: 'a2fbc5c1-160a-4c96-964e-76f58fd0aa02',
    name: 'Colete Sensorial de Compressão',
    url: 'colete-sensorial-compressao',
    isFeatured: true,
    isNew: true,
    hasShipping: true,
    sku: 'SENS002',
    description:
      '<p><strong>Colete sensorial de compressão</strong> que auxilia na autorregulação emocional e na redução da ansiedade.</p><ul><li>Compressão suave e uniforme</li><li>Tecido respirável</li><li>Indicado para uso diário</li></ul>',
    shortDescription: 'Colete para estímulo proprioceptivo',
    price: 249.9,
    allowSale: true,
    specialPrice: null,
    images: ['https://m.media-amazon.com/images/I/71HTT6N0JoL.jpg'],
    attributes: [
      { id: 'att003', name: 'Tamanho', value: 'Infantil e Adulto' },
      { id: 'att004', name: 'Material', value: 'Poliéster e elastano' },
    ],
    categories: [{ id: 'cat001', name: 'Regulação Sensorial' }],
  },
  {
    id: 'a3fbc5c1-160a-4c96-964e-76f58fd0aa03',
    name: 'Brinquedo Sensorial Pop It',
    url: 'brinquedo-sensorial-pop-it',
    isFeatured: true,
    isNew: true,
    hasShipping: true,
    sku: 'SENS003',
    description:
      '<p>Brinquedo sensorial tipo <strong>Pop It</strong>, ideal para estimular o tato e auxiliar no foco e relaxamento.</p>',
    shortDescription: 'Brinquedo tátil para estímulo sensorial',
    price: 29.9,
    allowSale: true,
    specialPrice: 24.9,
    images: ['https://images.tcdn.com.br/img/img_prod/388802/brinquedo_sensorial_pop_it_redondo_cores_22845_1_9c133b129c298e945ba7eae5f5692df5.jpg'],
    attributes: [
      { id: 'att005', name: 'Material', value: 'Silicone atóxico' },
      { id: 'att006', name: 'Idade Recomendada', value: '3+' },
    ],
    categories: [{ id: 'cat002', name: 'Brinquedos Sensoriais' }],
  },
  {
    id: 'a4fbc5c1-160a-4c96-964e-76f58fd0aa04',
    name: 'Cobertor Pesado Terapêutico',
    url: 'cobertor-pesado-terapeutico',
    isFeatured: true,
    isNew: true,
    hasShipping: true,
    sku: 'SENS004',
    description:
      '<p><strong>Cobertor pesado terapêutico</strong> indicado para promover sensação de segurança e melhorar a qualidade do sono.</p><ul><li>Peso distribuído uniformemente</li><li>Auxilia na redução da ansiedade</li></ul>',
    shortDescription: 'Cobertor com peso para relaxamento',
    price: 399.9,
    allowSale: true,
    specialPrice: 359.9,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlpDRk1SgyKHhfrI-ujZ-Ay0ITthbI2OwkUQ&s',
      'https://cdn.awsli.com.br/600x450/729/729904/produto/70045898/a2dadcad2f.jpg'
    ],
    attributes: [
      { id: 'att007', name: 'Peso', value: '5kg, 7kg ou 9kg' },
      { id: 'att008', name: 'Material', value: 'Algodão e microesferas' },
    ],
    categories: [{ id: 'cat003', name: 'Sono e Relaxamento' }],
  },
  {
    id: 'a5fbc5c1-160a-4c96-964e-76f58fd0aa05',
    name: 'Kit de Cartões de Comunicação Visual',
    url: 'kit-cartoes-comunicacao-visual',
    isFeatured: true,
    isNew: true,
    hasShipping: true,
    sku: 'SENS005',
    description:
      '<p><strong>Kit de cartões de comunicação visual</strong> para auxiliar na expressão de necessidades e emoções.</p><ul><li>Imagens claras e objetivas</li><li>Material resistente e plastificado</li></ul>',
    shortDescription: 'Cartões para apoio à comunicação',
    price: 79.9,
    allowSale: true,
    specialPrice: null,
    images: [
      'https://cdn.atualcard.com.br/arquivos/menu/normais/kit-amostra-premium-t1.png',
      'https://nanopsicologia.com.br/wp-content/uploads/2021/11/1-1024x1024-1.jpg'
    ],
    attributes: [
      { id: 'att009', name: 'Quantidade', value: '50 cartões' },
      { id: 'att010', name: 'Material', value: 'Papel plastificado' },
    ],
    categories: [{ id: 'cat004', name: 'Comunicação Alternativa' }],
  },
];
