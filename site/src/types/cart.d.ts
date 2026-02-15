import { Item } from "./item"

export type Cart = {
  id: string,
  name: string,
  items: Item[],
}
