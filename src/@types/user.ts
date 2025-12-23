export interface IAddress {
  _id: string;
  full_name: string;
  phone: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: number;
  country: string;
}

export interface CartItem {
  _id: string;
  quantity: number;
  product: {
    _id?: string;
    name: string;
    image?: string;
    category: Array<string>;
    subCategory: Array<string>;
    unit: string;
    stock: number;
    price: number;
    discount?: number | any;
    quantity: number;
    description: string;
    more_details?: Record<string, string>;
  };
}

export interface IOrderItem {
  _id: string;
  order_id: string;
  items: number;
  amount: number;
  payment_status: string;
  createdAt: string;
}

export interface IUserProfile {
  _id?: string;
  fname: string;
  lname: string;
  email: string;
  password?: string | any;
  avatar: string;
  phone?: number | null;
  verify_email: boolean;
  last_login_date?: string | null;
  refresh_token?: string;
  forgot_password_otp?: string;
  forgot_password_expiry?: Date;
  status: string;
  role: "USER" | "ADMIN" | "SUPER-ADMIN";
  address_details: IAddress[];
  shopping_cart: CartItem[];
  orderHistory: IOrderItem[];
}

export interface USERS {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  phone: number;
  verify_email: boolean;
  last_login_date?: string | null;
  status: string;
  role: "USER" | "ADMIN" | "SUPER-ADMIN";
  createdAt: string;
  updatedAt: string;
}
