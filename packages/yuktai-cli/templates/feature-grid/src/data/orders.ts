// Sample data for the grid: up to 25 lakh (2,500,000) orders, made in the browser.
// Nothing is downloaded: a seeded random generator gives the same rows on every visit.
// Replace makeOrders() with your own data (an API, a JSON file, IndexedDB…).
//
// Six columns, five data types:
//   id        text      "ORD-0000001"
//   customer  text      "Lakshmi Reddy"
//   city      badge     "Hyderabad"
//   amount    number    2499.5  (₹)
//   date      date      "2025-03-14"
//   paid      boolean   true

export type Order = { id: string; customer: string; city: string; amount: number; date: string; paid: boolean };

export const ROW_CHOICES = [1_000, 1_00_000, 10_00_000, 25_00_000] as const;
export const DEFAULT_ROWS = 25_00_000;
/** Phones and computers with little memory start at 10 lakh (25 lakh needs about 600 MB). */
export const LIGHT_ROWS = 10_00_000;

/** The starting row count for this device. Runs in the browser only. */
export function startRows(): number {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const phone = window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900;
  return phone || (memory !== undefined && memory < 8) ? LIGHT_ROWS : DEFAULT_ROWS;
}

const FIRST = ["Aarav", "Lakshmi", "Ravi", "Priya", "Arjun", "Sita", "Kiran", "Ananya", "Vikram", "Meera", "Rahul", "Divya", "Suresh", "Kavya", "Manoj", "Sneha", "Arun", "Pooja", "Naveen", "Deepa", "Rohan", "Anjali", "Sanjay", "Nithya", "Imran", "Fatima", "John", "Mary", "Harpreet", "Gurpreet"];
const LAST = ["Reddy", "Sharma", "Rao", "Iyer", "Naidu", "Patel", "Kumar", "Singh", "Menon", "Nair", "Gupta", "Das", "Khan", "Joshi", "Varma", "Pillai", "Chowdary", "Bose", "Mehta", "Thomas"];
const CITIES = ["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Delhi", "Pune", "Kolkata", "Visakhapatnam", "Vijayawada", "Kochi", "Jaipur", "Ahmedabad"];

// Strings are made once and shared, so lakhs of rows stay light on memory.
const NAMES = FIRST.flatMap((f) => LAST.map((l) => `${f} ${l}`));
const DAY = 86_400_000;
const START = Date.UTC(2024, 0, 1);
const DATES = Array.from({ length: 731 }, (_, i) => new Date(START + i * DAY).toISOString().slice(0, 10));

/** mulberry32: small, fast, seeded random numbers in [0, 1). */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(list: readonly T[], r: number) => list[Math.floor(r * list.length)];

/**
 * Makes `count` orders in slices of 50,000, giving the browser a breath between slices
 * so the page stays responsive. `onProgress` gets 0…1. Pass an AbortSignal to stop early.
 */
export async function makeOrders(count: number, onProgress?: (done: number) => void, signal?: AbortSignal): Promise<Order[]> {
  const rand = random(2026);
  const rows: Order[] = new Array(count);
  const SLICE = 50_000;
  for (let start = 0; start < count; start += SLICE) {
    if (signal?.aborted) throw new DOMException("Stopped", "AbortError");
    const end = Math.min(count, start + SLICE);
    for (let i = start; i < end; i++) {
      rows[i] = {
        id: `ORD-${String(i + 1).padStart(7, "0")}`,
        customer: pick(NAMES, rand()),
        city: pick(CITIES, rand()),
        amount: Math.round((99 + rand() * 49_900) * 2) / 2,
        date: pick(DATES, rand()),
        paid: rand() < 0.72,
      };
    }
    onProgress?.(end / count);
    await new Promise((r) => setTimeout(r, 0));
  }
  return rows;
}

/** 1000000 → "10,00,000" (Indian digit grouping). */
export const indian = (n: number) => n.toLocaleString("en-IN");
