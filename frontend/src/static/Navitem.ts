export interface NavItemType {
  label: string;
  path: string;
  id: number;
}

const Navitem: NavItemType[] = [
  { label: "Home", path: "/", id: 1 },
  { label: "All Products", path: "/products", id: 2 },
  { label: "Artisan Guilds", path: "/artisans", id: 3 },
  { label: "Cultural Events", path: "/event", id: 4 },
  { label: "Habesha Rewards", path: "/rewards", id: 5 },
  { label: "Buyer Protection", path: "/resolution-center", id: 6 },
  { label: "FAQ", path: "/faq", id: 7 },
];

export default Navitem;
