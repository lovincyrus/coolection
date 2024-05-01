export interface Coolection {
  id: string;
  url: string;
  title: string;
  description: string;
  image?: string;
  embedding: number[];
  createdAt?: string;
  updatedAt?: string;
}
