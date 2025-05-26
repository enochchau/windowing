import {
  useVirtualGrid,
  VirtualGrid,
  AutoSizer,
  useAutoSizer,
} from "@windowing/core";
import css from "./CsvViewer.module.css";
import { CsvModal } from "./CsvModal";
import { SearchBar } from "./SearchBar";

import { useMemo, useState, useEffect, useCallback, memo } from "react";
import { demoRawCsv } from "./demoRawCsv";
import { Button } from "./components/Button";
import { SettingsIcon } from "lucide-react";
import { Settings } from "./components/Settings";
import { Popover } from "./components/Popover";

type SearchResult = {
  columnIndex: number;
  rowIndex: number;
};

const scrollOpts = { block: "center", inline: "center" } as const;

export function CsvViewer() {
  const [search, setSearch] = useState("");
  const [searchResultIndex, setSearchResultIndex] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState(demoRawCsv);
  const [fixedColumns, setFixedColumns] = useState("0");
  const [fixedRows, setFixedRows] = useState("1");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { ref: autoSizerRef, dimensions, isReady } = useAutoSizer();

  const csv = useMemo(() => parseToCsv(textAreaValue), [textAreaValue]);

  const columnWidths = useMemo(() => csvToColumnWidths(csv), [csv]);

  const { results: searchResults, resultSet: searchResultsSet } =
    useMemo(() => {
      if (!search) {
        return { results: [], resultSet: new Set() };
      }
      const results = findSearchResults(search, csv);
      const resultSet = new Set(
        results.map(
          ({ columnIndex, rowIndex }) => `${rowIndex};${columnIndex}`,
        ),
      );
      return { results, resultSet };
    }, [search, csv]);

  const { gridProps, scrollToCell } = useVirtualGrid({
    height: dimensions.height,
    width: dimensions.width,
    rowCount: csv.length,
    columnCount: csv[0]?.length ?? 0,
    rowHeight: 40,
    columnWidth: (ci) => columnWidths[ci] * 10,
    stickyRowCount: parseInt(fixedRows),
    stickyColumnCount: parseInt(fixedColumns),
  });

  const handleCsvImport = (csvData: string) => {
    setTextAreaValue(csvData);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSearchResultIndex(0);
  };

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    setSearch("");
    setSearchResultIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    let nextIndex = searchResultIndex + 1;
    if (nextIndex > searchResults.length - 1) {
      nextIndex = 0;
    }
    setSearchResultIndex(nextIndex);
    const args = searchResults[nextIndex];
    if (args) {
      scrollToCell(args, scrollOpts);
    }
  }, [searchResultIndex, searchResults, scrollToCell]);

  const handlePrev = useCallback(() => {
    let nextIndex = searchResultIndex - 1;
    if (nextIndex < 0) {
      nextIndex = searchResults.length - 1;
    }
    setSearchResultIndex(nextIndex);
    const args = searchResults[nextIndex];
    if (args) {
      scrollToCell(args, scrollOpts);
    }
  }, [searchResultIndex, searchResults, scrollToCell]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F or Ctrl+F to open/close search
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        if (isSearchOpen) {
          handleSearchClose();
        } else {
          handleSearchOpen();
        }
      }
      // Cmd+G or F3 for next result
      else if (
        ((e.metaKey || e.ctrlKey) && e.key === "g" && !e.shiftKey) ||
        e.key === "F3"
      ) {
        e.preventDefault();
        if (isSearchOpen && searchResults.length > 0) {
          handleNext();
        }
      }
      // Cmd+Shift+G or Shift+F3 for previous result
      else if (
        ((e.metaKey || e.ctrlKey) && e.key === "g" && e.shiftKey) ||
        (e.key === "F3" && e.shiftKey)
      ) {
        e.preventDefault();
        if (isSearchOpen && searchResults.length > 0) {
          handlePrev();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isSearchOpen,
    searchResults.length,
    handleNext,
    handlePrev,
    handleSearchClose,
  ]);

  return (
    <div className={css["container"]}>
      <div className={css["control-container"]}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
        >
          Import CSV
        </Button>

        <Popover
          placement="bottom-end"
          trigger={
            <Button variant="ghost" size="sm">
              <SettingsIcon size={14} />
            </Button>
          }
        >
          <Settings
            fixedRows={fixedRows}
            fixedColumns={fixedColumns}
            onFixedRowsChange={setFixedRows}
            onFixedColumnsChange={setFixedColumns}
          />
        </Popover>
      </div>
      <div className={css["grid-container"]}>
        <SearchBar
          isOpen={isSearchOpen}
          search={search}
          currentIndex={searchResultIndex}
          totalResults={searchResults.length}
          onSearchChange={handleSearchChange}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleSearchClose}
        />
        <AutoSizer autoSizerRef={autoSizerRef}>
          {isReady && dimensions.width > 0 && dimensions.height > 0 ? (
            <VirtualGrid
              {...gridProps}
              rowOverflow={3}
              columnOverflow={3}
              rowHover
              columnHover
              itemRenderer={({
                isHovering,
                isSticky,
                rowIndex,
                columnIndex,
              }) => (
                <Cell
                  isSticky={isSticky}
                  isHovering={isHovering}
                  highlight={
                    rowIndex === searchResults[searchResultIndex]?.rowIndex &&
                    columnIndex ===
                      searchResults[searchResultIndex]?.columnIndex
                  }
                  found={searchResultsSet.has(`${rowIndex};${columnIndex}`)}
                >
                  {csv[rowIndex][columnIndex]}
                </Cell>
              )}
            />
          ) : (
            <div>Loading...</div>
          )}
        </AutoSizer>
      </div>

      <CsvModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCsvImport}
        initialValue={textAreaValue}
      />
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
const Cell = memo(
  ({ isHovering, isSticky, children, highlight, found }: CellProps) => {
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
  },
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
