import { ListItem } from "./ListItem";
import { VirtualGrid } from "./lib/VirtualGrid";
import { useVirtualGrid } from "./lib/useVirtualGrid";
import css from "./GridDemo.module.css";

const rows = 100;
const cols = 100;
const cellData: string[][] = [];

for (let i = 0; i < rows; i++) {
  cellData[i] = [];
  for (let j = 0; j < cols; j++) {
    cellData[i][j] = `I ${i} ${j}`;
  }
}

export function GridDemo() {
  const { gridProps, scrollToCell } = useVirtualGrid({
    stickyColumnCount: 2,
    stickyRowCount: 2,
    height: 400,
    width: 600,
    columnCount: cellData[0].length,
    rowCount: cellData.length,
    columnWidth: (index: number) => {
      if (index % 5 === 0) return 120;
      if (index % 2 === 0) return 100;
      return 80;
    },
    rowHeight: (index: number) => {
      if (index % 5 === 0) return 50;
      if (index % 2 === 0) return 40;
      return 30;
    },
  });

  const scrollRowIndex = 58;
  const scrollColumnIndex = 11;

  return (
    <div className={css["container"]}>
      <div>
        <button
          onClick={() =>
            scrollToCell({
              rowIndex: scrollRowIndex,
              columnIndex: scrollColumnIndex,
            })
          }
        >
          Scroll to {scrollRowIndex},{scrollColumnIndex} - Start
        </button>
        <button
          onClick={() =>
            scrollToCell(
              {
                rowIndex: scrollRowIndex,
                columnIndex: scrollColumnIndex,
              },
              { inline: "center", block: "center" }
            )
          }
        >
          Scroll to {scrollRowIndex},{scrollColumnIndex} - Center
        </button>
        <button
          onClick={() =>
            scrollToCell(
              {
                rowIndex: scrollRowIndex,
                columnIndex: scrollColumnIndex,
              },
              { inline: "end", block: "end" }
            )
          }
        >
          Scroll to {scrollRowIndex},{scrollColumnIndex} - End
        </button>
      </div>
      <div>
        <VirtualGrid
          {...gridProps}
          rowOverflow={3}
          columnOverflow={3}
          rowHover
          columnHover
          itemRenderer={({ isHovering, rowIndex, columnIndex, isSticky }) => (
            <ListItem
              isSticky={isSticky}
              isHovering={isHovering}
              style={{
                backgroundColor:
                  rowIndex === scrollRowIndex &&
                  columnIndex === scrollColumnIndex
                    ? "yellow"
                    : undefined,
              }}
            >
              {cellData[rowIndex][columnIndex]}
            </ListItem>
          )}
        />
      </div>
    </div>
  );
}
