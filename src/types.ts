export type Thread = {
  id: number;
  created_at: string;
  post_id: number | null;
};

export type Message = {
  id: number;
  thread_id: number;
  sender_id: string;
  content: string;
  created_at: string;
};

export type ThreadParticipant = {
  thread_id: number;
  user_id: string;
};

export type UserProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
  photo_profile_url: string | null;
};

export type CardProps = {
  id: number;
  status: 'lost' | 'found';
  imageUrl: string;
  altText: string;
  title: string;
  date: string;
  location: string;
};

export type FullCardProps = {
  id: number;
  status: 'lost' | 'found';
  imageUrl: string;
  altText: string;
  title: string;
  date: string;
  rawDate: string;
  location: string;
  description: string;
  userId: string;
  authorName: string;
  authorAvatarUrl: string | null;
};

export type Post = {
    id: number;
    created_at: string;
    title: string;
    description: string | null;
    photo_url: string | null;
    location: string | null;
    user_id: string;
    post_state_id: number;
    date_was_found: string | null;
};


export type UserProps = {
  id: string;
  email: string;
  fullName: string;
  photoUrl: string;
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

export type AlertMessage = {
  type: 'success' | 'error';
  title: string;
  description: string;
};