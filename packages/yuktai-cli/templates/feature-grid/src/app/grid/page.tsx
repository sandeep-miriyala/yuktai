import type { Metadata } from "next";
import ProductGrid from "./ProductGrid";

export const metadata: Metadata = { title: "Data grid" };

export default function GridPage() {
  return (
    <section className="wrap">
      <p className="kicker">Data grid</p>
      <h1>Products</h1>
      <p className="lead">Search, sort and page through the list. Sorting and search run in Rust (WebAssembly) when it is available. Select a column heading to sort by it.</p>
      <ProductGrid />
    </section>
  );
}
