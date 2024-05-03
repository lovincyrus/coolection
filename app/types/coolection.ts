export interface CoolectionItem {
  id: string;
  url?: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  type: ItemType;
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

export enum ItemType {
  _WEBSITE = "website",
  _TWEET = "tweet",
}
