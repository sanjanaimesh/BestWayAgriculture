export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Agent {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  phone: string;
  email: string;
  image: string;
  bio: string;
}