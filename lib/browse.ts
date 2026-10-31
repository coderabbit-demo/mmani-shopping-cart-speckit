import type { Category, Product } from "./catalog";

export type BrowseFilters = {
  query: string;
  category: Category;
  inStockOnly: boolean;
  sort: "featured" | "price-asc" | "price-desc" | "rating";
};
export const defaultFilters: BrowseFilters = { query: "", category: "All objects", inStockOnly: false, sort: "featured" };
export const sortOptions: { value: BrowseFilters["sort"]; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];
export function quickAddColor(product: Product): string {
  return product.colors[0].name;
}
export function filterProducts(products: Product[], filters: BrowseFilters): Product[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = products.filter((product) =>
    (filters.category === "All objects" || product.category === filters.category) &&
    (!filters.inStockOnly || product.inStock) &&
    [product.name, product.subtitle, product.category].some((field) => field.toLowerCase().includes(query)),
  );
  if (filters.sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (filters.sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (filters.sort === "rating") filtered.sort((a, b) => Number(b.rating) - Number(a.rating));
  return filtered;
}
