"use client";

import { YuktaiGrid, type GridColumn } from "@yuktishaalaa/yuktai";
import config from "@config";
import { PRODUCTS, type Product } from "@/data/products";

const columns: GridColumn<Product>[] = [
  { key: "id", label: "ID", sortable: true, width: 90 },
  { key: "name", label: "Product", sortable: true },
  { key: "category", label: "Category", sortable: true, type: "badge" },
  { key: "city", label: "City", sortable: true, hiddenOnMobile: true },
  { key: "price", label: "Price (₹)", sortable: true, type: "number", align: "right" },
  { key: "stock", label: "In stock", sortable: true, type: "number", align: "right" },
];

export default function ProductGrid() {
  return (
    <YuktaiGrid
      data={PRODUCTS}
      columns={columns}
      rowKey="id"
      search
      pagination={{ pageSize: 10 }}
      engine={config.engine}
      showSearchTime
    />
  );
}
