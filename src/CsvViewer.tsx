import { useVirtualGrid } from "./lib/useVirtualGrid";
import css from "./CsvViewer.module.css";
import { VirtualGrid } from "./lib/VirtualGrid";
import { useWindowSize } from "./useWindowSize";

import { useState } from "react";
import { demoRawCsv } from "./demoRawCsv";

type SearchResult = {
  columnIndex: number;
  rowIndex: number;
};

const scrollOpts = { block: "center", inline: "center" } as const;

export function CsvViewer() {
  const { height, width } = useWindowSize();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchResultIndex, setSearchResultIndex] = useState(0);

  const [textAreaValue, setTextAreaValue] = useState(demoRawCsv);
  const [csv, setCsv] = useState<string[][]>(parseToCsv(textAreaValue));
  const { gridProps, scrollToCell } = useVirtualGrid({
    height: height - 132,
    width: width - 48,
    rowCount: csv.length,
    columnCount: csv[0].length,
    rowHeight: 40,
    columnWidth: 60,
    stickyRowCount: 1,
  });

  const handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setTextAreaValue(e.currentTarget.value);
    setCsv(parseToCsv(e.currentTarget.value));
  };

  const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const search = e.currentTarget.value;
    setSearch(search);

    const results: SearchResult[] = [];
    if (!search) {
      setSearchResults(results);
      setSearchResultIndex(0);
      return;
    }

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
    setSearchResults(results);
    setSearchResultIndex(0);
    scrollToCell({ ...results[0] }, scrollOpts);
  };

  const handleNext = () => {
    let nextIndex = searchResultIndex + 1;
    if (nextIndex > searchResults.length - 1) {
      nextIndex = 0;
    }
    setSearchResultIndex(nextIndex);
    scrollToCell(
      {
        ...searchResults[nextIndex],
      },
      scrollOpts
    );
  };
  const handlePrev = () => {
    let nextIndex = searchResultIndex - 1;
    if (nextIndex < 0) {
      nextIndex = searchResults.length - 1;
    }
    setSearchResultIndex(nextIndex);
    scrollToCell(
      {
        ...searchResults[nextIndex],
      },
      scrollOpts
    );
  };

  const searchResultSet = new Set(
    searchResults.map(
      ({ columnIndex, rowIndex }) => `${rowIndex};${columnIndex}`
    )
  );

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
              found={searchResultSet.has(`${rowIndex};${columnIndex}`)}
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
const Cell = ({
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
          ? "yellowgreen"
          : "white",
      }}
    >
      {children}
    </div>
  );
};

function parseToCsv(raw: string): string[][] {
  const lines = raw.split("\n");
  const csv = lines.filter((l) => !!l).map((line) => line.split(","));
  return csv;
}
