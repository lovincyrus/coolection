export interface CoolectionItem {
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

export type CoolectionItemWithSimilarity = CoolectionItem & Similarity;

export interface CoolectionList {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  items: CoolectionItem[];
}

export enum ItemType {
  _WEBSITE = "website",
  _TWEET = "tweet",
}
