export interface Tour {
  id: string;
  numericId?: number;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  price: string;
  duration?: string;
  location?: string;
  rating?: number;
  badge?: string;
  bestSeason?: string;
  difficulty?: "Easy" | "Moderate" | "Challenging" | "Extreme";
  category?: string;
  subcategory?: string;
  highlights?: string[];
  includes?: string[];
  gallery?: string[];
  maxGroup?: number;
}

export interface Event {
  id: string;
  numericId?: number;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  date: string;
  time: string;
  category: string;
  price: string;
  location?: string;
  highlights?: string[];
  availableTickets?: number;
  totalTickets?: number;
}

export interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  region: string;
  altitude?: string;
  tourCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
  readTime: string;
  content?: string[];
  tags?: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
}

export interface Testimonial {
  name: string;
  location: string;
  text: string;
  image: string;
  rating?: number;
}
