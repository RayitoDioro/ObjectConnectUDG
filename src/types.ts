export type Thread = {
  id: number;
  created_at: string;
  post_id: number | null;
};

export type Category = {
  id: number;
  name: string;
  created_at: string;
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
  role_id: number | null;
  creation_date: string | null;
};

export type Role = {
  id: number;
  role_name: string;
  descripcion: string;
  created_at: string;
}

export type UserWithRole = 
  UserProfile & { Roles?: Role } ;

export type CardProps = {
  id: number;
  status: 'lost' | 'found';
  imageUrl: string;
  altText: string;
  title: string;
  date: string;
  location: string;
  locationAreaName?: string;
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
  locationAreaName?: string;
  description: string;
  userId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  categoryId: number;
};

export type Post = {
    id: number;
    created_at: string;
    title: string;
    description: string | null;
    photo_url: string | null;
    location: string | null;
    location_area_id?: number;
    location_area_name?: string | null;
    user_id: string;
    post_state_id: number;
    date_was_found: string | null;
    product_category_id?: number;
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

export type Statistics = {
  totalUsers: number;
  totalRoles: number;
  totalPosts: number;
  activeUsers: number;
};

export interface RolePermissions {
  roleId: number;
  roleName: string;
  permissions: string[]; // Array de strings como 'create_posts', 'delete_users', etc
}

export interface Permission {
  id: number;
  permiso: string;
  created_at : string;
  descripcion: string;
}