export interface CoolectionItem {
  id: string;
  url?: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  metadata?: any;
}

export interface CoolectionList {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<CoolectionItem>;
}
