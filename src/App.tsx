import { VirtualGrid } from "./VirtualGrid";
import css from "./App.module.css";
// import { VirtualList } from "./VirtualList";
import { classNames } from "./classNames";
import { useVirtualGrid } from "./useVirtualGrid";

// const itemData = Array.from({ length: 1000 }, (_, i) => `I ${i}`);

const rows = 1000;
const cols = 1000;
const cellData: string[][] = [];

for (let i = 0; i < rows; i++) {
  cellData[i] = [];
  for (let j = 0; j < cols; j++) {
    cellData[i][j] = `I ${i} ${j}`;
  }
}

export function App() {
  const { gridProps, scrollToCell } = useVirtualGrid({
    stickyColumnCount: 2,
    stickyRowCount: 2,
    height: 400,
    width: 600,
    columnCount: 100,
    rowCount: 100,
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
    <div className={css["app-container"]}>
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
      <div>
        {/* <VirtualList
          itemCount={itemData.length}
          overflowCount={3}
          itemHeight={(index) => {
            if (index % 5 === 0) return 30;
            if (index % 2 === 0) return 40;
            return 50;
          }}
          height={400}
          width={600}
          itemRenderer={({ index, isSticky }) => (
            <ListItem isSticky={isSticky}>{itemData[index]}</ListItem>
          )}
          stickyRowCount={1}
        /> */}
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
interface ListItemProps {
  children: React.ReactNode;
  isSticky: boolean;
  isHovering?: boolean;
  style?: React.CSSProperties;
}
function ListItem({ style, isHovering, isSticky, children }: ListItemProps) {
  return (
    <div
      style={style}
      className={classNames({
        [css["list-item"]]: true,
        [css["list-item-sticky"]]: isSticky,
        [css["list-item-hovering"]]: !!isHovering,
      })}
    >
      {children}
    </div>
  );
}
