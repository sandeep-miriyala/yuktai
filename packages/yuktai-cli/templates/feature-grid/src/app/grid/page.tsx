import type { Metadata } from "next";
import "@/styles/grid.css";
import OrdersGrid from "./OrdersGrid";

export const metadata: Metadata = { title: "Data grid" };

export default function GridPage() {
  return (
    <section className="wrap">
      <p className="kicker">Data grid</p>
      <h1>25 lakh orders</h1>
      <p className="lead">
        25 lakh (2.5 million) sample orders, made in your browser in about a second (10 lakh on phones; pick any size above the grid). Six columns and five data types: text, badge, number,
        date and yes/no. Search and sorting on every column run in Rust (WebAssembly); nothing is sent anywhere. Select a column
        heading to sort by it, or press <strong>Show all</strong> to scroll through every row in one list.
      </p>
      <OrdersGrid />
      <p className="note">
        Sample data comes from <code>src/data/orders.ts</code>. Replace <code>makeOrders()</code> with your own rows.
      </p>
    </section>
  );
}
