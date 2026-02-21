export interface Item {
  id: string;
  url?: string;
  title: string;
  description?: string;
  content?: string;
  context?: any;
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
  source?: string | null;
  createdAt: string;
  updatedAt: string;
  items: Item[];
}

export enum ItemType {
  _WEBSITE = "website",
  _TWEET = "tweet",
  _GITHUB_STAR = "github_star",
}
