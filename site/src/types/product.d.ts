export type Product = {
  id: string,
  name: string,
  price: number,
  description: string | null,
  shortDescription: string | null,
  attributes: ProductAttribute[] | null,
  specialPrice: number | null,
  sku: string,
  categories: ProductCategory[] | null,
  images: string[] | null,
  url: string,
  isFeatured: boolean,
  isNew: boolean,
  hasShipping: boolean,
  allowSale: boolean,
}

type ProductAttribute = {
  id: string,
  name: string,
  value: string
}

type ProductCategory = {
  id: string,
  name: string,
}
