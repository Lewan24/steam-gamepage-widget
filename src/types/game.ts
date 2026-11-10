export type Game = {
  id: string;
  name: string;
  description: string;
  header: string;
  screenshots: string[];
  developers: string[];
  genres: string[];
  platforms: { windows?: boolean; mac?: boolean; linux?: boolean };
  release: string;
  comingSoon: boolean;
  price: { formatted: string; original?: string; discount: number } | null;
  reviews: { total: number; positive: number } | null;
};
