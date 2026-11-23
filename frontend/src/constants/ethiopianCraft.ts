export interface CraftCategory {
  id: number;
  title: string;
  subTitle: string;
  image_Url: string;
}

export const ETHIOPIAN_CRAFT_CATEGORIES: CraftCategory[] = [
  {
    id: 1,
    title: "Habesha Kemis",
    subTitle: "Handwoven women's traditional dresses & Tibeb embroidery",
    image_Url: "/photo.jpg",
  },
  {
    id: 2,
    title: "Men's Attire",
    subTitle: "Traditional suits, vests, and modern Habesha shirts",
    image_Url: "/hero.jpg",
  },
  {
    id: 3,
    title: "Kids Collection",
    subTitle: "Authentic cultural dresses and suits for children",
    image_Url: "/child/10005.jpg",
  },
  {
    id: 4,
    title: "Gabi & Netela",
    subTitle: "Premium hand-spun cotton blankets and ceremonial shawls",
    image_Url: "/10115.jpg",
  },
  {
    id: 5,
    title: "Ceremonial & Elders",
    subTitle: "Distinguished heritage vestments for special occasions",
    image_Url: "/elder/10009.jpg",
  },
  {
    id: 6,
    title: "Accessories & Jewelry",
    subTitle: "Traditional crosses, beads, and cultural adornments",
    image_Url: "/10138.jpg",
  },
];

export const ARTISAN_REGIONS = [
  "Shiro Meda (Addis Ababa)",
  "Dorze Highlands (Gamo)",
  "Gondar Heritage Center",
  "Harar Jugol Craft Atelier",
  "Axum Ancient Weavers Guild",
  "Jimma Traditional Loom District",
];
