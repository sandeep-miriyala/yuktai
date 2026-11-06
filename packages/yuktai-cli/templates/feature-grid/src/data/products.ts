// Sample data for the grid page. Replace it with your own.
export type Product = { id: string; name: string; category: string; city: string; price: number; stock: number };

const NAMES = ["Notebook", "Water bottle", "Desk lamp", "Backpack", "Headphones", "Pen set", "Chair", "Monitor", "Keyboard", "Mouse", "Bookshelf", "Plant pot"];
const CATEGORIES = ["Stationery", "Home", "Electronics", "Furniture"];
const CITIES = ["Hyderabad", "Bengaluru", "Chennai", "Pune", "Delhi", "Mumbai"];

export const PRODUCTS: Product[] = Array.from({ length: 60 }, (_, i) => ({
  id: `P${String(i + 1).padStart(3, "0")}`,
  name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  category: CATEGORIES[(i * 7) % CATEGORIES.length],
  city: CITIES[(i * 5) % CITIES.length],
  price: 150 + ((i * 397) % 4850),
  stock: (i * 13) % 90,
}));
