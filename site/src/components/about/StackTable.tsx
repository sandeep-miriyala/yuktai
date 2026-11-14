"use client";

import { useState } from "react";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, SortIcon } from "@yuktishaalaa/yuktai/icons";

export type StackRow = { layer: string; tool: string; version: string; why: string };

// TanStack Table v9: the table keeps rows and sort order; the markup below is ours.
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});
const helper = createColumnHelper<typeof features, StackRow>();
const columns = helper.columns([
  helper.accessor("layer", { header: "Layer", sortFn: "alphanumeric" }),
  helper.accessor("tool", { header: "Tool", sortFn: "alphanumeric" }),
  helper.accessor("version", { header: "Version", enableSorting: false }),
  helper.accessor("why", { header: "Why", enableSorting: false }),
]);

export default function StackTable({ rows }: { rows: StackRow[] }) {
  const [data] = useState(rows);
  const table = useTable({ features, columns, data });

  return (
    <div className="table-box" tabIndex={0} role="region" aria-label="Stack table (scrolls sideways)">
      <table className="compare stack-table">
        <caption className="sr-only">The tools this site is built with. Layer and Tool columns can be sorted.</caption>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : canSort ? "none" : undefined}
                  >
                    {canSort ? (
                      <button type="button" className="sort-btn" onClick={header.column.getToggleSortingHandler()}>
                        <table.FlexRender header={header} />
                        {sorted === "asc" ? <ArrowUpIcon size={16} aria-hidden="true" /> : sorted === "desc" ? <ArrowDownIcon size={16} aria-hidden="true" /> : <SortIcon size={16} aria-hidden="true" />}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell, i) =>
                i === 0 ? (
                  <th key={cell.id} scope="row"><table.FlexRender cell={cell} /></th>
                ) : (
                  <td key={cell.id} className={cell.column.id === "version" ? "mono" : cell.column.id === "why" ? "them" : undefined}>
                    <table.FlexRender cell={cell} />
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
