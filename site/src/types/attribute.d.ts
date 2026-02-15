export type Attribute = {
  id: string;
  name: string;
  filterType: 'any' | 'equal';
  options: AttributeOption[];
};

export type AttributeOption = {
  id: string;
  name: string;
};
