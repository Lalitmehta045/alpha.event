export type OrderStatus = "Pending" | "Completed" | "Cancelled" | "Refunded";

export interface Order {
  id: string;
  customerName: string;
  email: string;
  avatar: string;
  date: string;
  time: string;
  items: number;
  price: number;
  status: OrderStatus;
}

export const orders: Order[] = [
  {
    id: "6010",
    customerName: "Jayvion Simon",
    email: "nannie.abernathy70@yahoo.com",
    avatar: "/avatars/01.png",
    date: "11 Nov 2025",
    time: "5:26 pm",
    items: 6,
    price: 484.15,
    status: "Refunded",
  },
  {
    id: "6011",
    customerName: "Lucian Obrien",
    email: "ashlynn.ohara62@gmail.com",
    avatar: "/avatars/02.png",
    date: "10 Nov 2025",
    time: "4:26 pm",
    items: 1,
    price: 83.74,
    status: "Completed",
  },
  {
    id: "6012",
    customerName: "Jayvion Simon",
    email: "nannie.abernathy70@yahoo.com",
    avatar: "/avatars/01.png",
    date: "11 Nov 2025",
    time: "5:26 pm",
    items: 6,
    price: 484.15,
    status: "Pending",
  },
  {
    id: "6013",
    customerName: "Jayvion Simon",
    email: "nannie.abernathy70@yahoo.com",
    avatar: "/avatars/01.png",
    date: "11 Nov 2025",
    time: "5:26 pm",
    items: 6,
    price: 484.15,
    status: "Cancelled",
  },
  // ... add more
];
