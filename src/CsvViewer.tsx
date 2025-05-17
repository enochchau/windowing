import { useVirtualGrid } from "./lib/useVirtualGrid";
import css from "./CsvViewer.module.css";
import { VirtualGrid } from "./lib/VirtualGrid";
import { useWindowSize } from "./useWindowSize";

import { useMemo, useState } from "react";
import { demoRawCsv } from "./demoRawCsv";
import React from "react";

type SearchResult = {
  columnIndex: number;
  rowIndex: number;
};

const scrollOpts = { block: "center", inline: "center" } as const;

export function CsvViewer() {
  const { height, width } = useWindowSize();
  const [search, setSearch] = useState("");
  const [searchResultIndex, setSearchResultIndex] = useState<number>(0);
  const [textAreaValue, setTextAreaValue] = useState(demoRawCsv);
  const [fixedColumns, setFixedColumns] = useState("0");
  const [fixedRows, setFixedRows] = useState("1");

  const csv = useMemo(() => parseToCsv(textAreaValue), [textAreaValue]);

  const columnWidths = useMemo(() => csvToColumnWidths(csv), [csv]);

  const { results: searchResults, resultSet: searchResultsSet } =
    useMemo(() => {
      if (!search) {
        return { results: [], resultSet: new Set() };
      }
      const results = findSearchResults(search, csv);
      const resultSet = new Set(
        results.map(({ columnIndex, rowIndex }) => `${rowIndex};${columnIndex}`)
      );
      return { results, resultSet };
    }, [search, csv]);

  const { gridProps, scrollToCell } = useVirtualGrid({
    height: height - 132,
    width: width - 48,
    rowCount: csv.length,
    columnCount: csv[0]?.length ?? 0,
    rowHeight: 40,
    columnWidth: (ci) => columnWidths[ci] * 10,
    stickyRowCount: parseInt(fixedRows),
    stickyColumnCount: parseInt(fixedColumns),
  });

  const handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setTextAreaValue(e.currentTarget.value);
  };

  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const search = e.currentTarget.value;
    setSearch(search);
    setSearchResultIndex(0);
  };

  const handleNext = () => {
    let nextIndex = searchResultIndex + 1;
    if (nextIndex > searchResults.length - 1) {
      nextIndex = 0;
    }
    setSearchResultIndex(nextIndex);
    const args = searchResults[nextIndex];
    if (args) scrollToCell(args, scrollOpts);
  };
  const handlePrev = () => {
    let nextIndex = searchResultIndex - 1;
    if (nextIndex < 0) {
      nextIndex = searchResults.length - 1;
    }
    setSearchResultIndex(nextIndex);
    const args = searchResults[nextIndex];
    if (args) scrollToCell(args, scrollOpts);
  };

  return (
    <div className={css["container"]}>
      <div className={css["control-container"]}>
        <label>
          csv
          <textarea
            style={{ resize: "none" }}
            onChange={handleTextAreaChange}
            value={textAreaValue}
          />
        </label>
        <label>
          search {searchResultIndex} / {searchResults.length}
          <input value={search} onChange={handleSearch} />
        </label>
        <button onClick={handlePrev}>prev</button>
        <button onClick={handleNext}>next</button>
        <label>
          fixed rows
          <input
            min={0}
            type="number"
            value={fixedRows}
            onChange={(e) => setFixedRows(e.currentTarget.value)}
          />
        </label>
        <label>
          fixed columns
          <input
            min={0}
            type="number"
            value={fixedColumns}
            onChange={(e) => setFixedColumns(e.currentTarget.value)}
          ></input>
        </label>
      </div>
      <div className={css["grid-container"]}>
        <VirtualGrid
          {...gridProps}
          rowOverflow={3}
          columnOverflow={3}
          rowHover
          columnHover
          itemRenderer={({ isHovering, isSticky, rowIndex, columnIndex }) => (
            <Cell
              isSticky={isSticky}
              isHovering={isHovering}
              highlight={
                rowIndex === searchResults[searchResultIndex]?.rowIndex &&
                columnIndex === searchResults[searchResultIndex]?.columnIndex
              }
              found={searchResultsSet.has(`${rowIndex};${columnIndex}`)}
            >
              {csv[rowIndex][columnIndex]}
            </Cell>
          )}
        />
      </div>
    </div>
  );
}

interface CellProps {
  isSticky: boolean;
  children: React.ReactNode;
  highlight?: boolean;
  found?: boolean;
  isHovering: boolean;
}
const Cell = React.memo(
  ({
    isHovering,
    isSticky,
    children,
    highlight,
    found,
  }: CellProps) => {
    return (
      <div
        className={css.cell}
        style={{
          background: highlight
            ? "yellow"
            : found
            ? "pink"
            : isSticky
            ? "#9f9f9f"
            : isHovering
            ? "gainsboro"
            : "white",
        }}
      >
        {children}
      </div>
    );
  }
);

function parseToCsv(raw: string): string[][] {
  const lines = raw.split("\n");
  const csv = lines.filter((l) => !!l).map((line) => line.split(","));
  return csv;
}

function csvToColumnWidths(csv: string[][]) {
  const widths: number[] = [];
  for (let j = 0; j < (csv[0]?.length ?? 0); j++) {
    let max = 0;
    for (let i = 0; i < csv.length; i++) {
      max = Math.max(max, csv[i][j].length);
    }
    widths.push(max);
  }
  return widths;
}

function findSearchResults(search: string, csv: string[][]) {
  const results: SearchResult[] = [];

  for (let rowIndex = 0; rowIndex < csv.length; rowIndex++) {
    for (
      let columnIndex = 0;
      columnIndex < csv[rowIndex].length;
      columnIndex++
    ) {
      if (csv[rowIndex][columnIndex].includes(search)) {
        results.push({
          rowIndex: rowIndex,
          columnIndex: columnIndex,
        });
      }
    }
  }

  return results;
}
