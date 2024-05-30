export interface Item {
  id: string;
  url?: string;
  title: string;
  description?: string;
  content?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isDeleted?: boolean;
  type: ItemType;
  metadata?: any;
}

interface Similarity {
  similarity?: number;
}

export type ItemWithSimilarity = Item & Similarity;

export interface List {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  items: Item[];
}

export enum ItemType {
  _WEBSITE = "website",
  _TWEET = "tweet",
}
