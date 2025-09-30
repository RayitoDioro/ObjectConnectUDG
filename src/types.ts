export type CardProps = {
  id: number;
  status: 'lost' | 'found';
  imageUrl: string;
  altText: string;
  title: string;
  date: string;
  location: string;
};

export type ObjectGridProps = {
  lostItems: CardProps[];
  foundItems: CardProps[];
  searchObj: string;
};

export type FilterControlsProps = {
  searchObj: string;
  setSearchObj: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
};