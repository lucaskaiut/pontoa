import { Category } from "./category"
import { Product } from "./product"

export type Route = {
  type: 'product' | 'category',
  category?: Category,
  product?: Product
}
