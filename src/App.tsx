import { VirtualGrid } from "./VirtualGrid";
import css from "./App.module.css";
import { VirtualList } from "./VirtualList";
import { classNames } from "./classNames";

const itemData = Array.from({ length: 1000 }, (_, i) => `I ${i}`);

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
  return (
    <div className={css["app-container"]}>
      <div>
        <VirtualList
          itemCount={itemData.length}
          overflowCount={3}
          itemHeight={30}
          height={400}
          width={600}
          itemRenderer={({ index, isSticky }) => (
            <ListItem isSticky={isSticky}>{itemData[index]}</ListItem>
          )}
          stickyRowCount={3}
        />
      </div>
      <div>
        <VirtualGrid
          height={400}
          width={600}
          columnWidth={100}
          columnCount={100}
          rowCount={100}
          rowHeight={30}
          overflowCount={3}
          stickyRowCount={2}
          stickyColumnCount={2}
          rowHover
          columnHover
          itemRenderer={({ isHovering, rowIndex, columnIndex, isSticky }) => (
            <ListItem isSticky={isSticky} isHovering={isHovering}>
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
}
function ListItem({ isHovering, isSticky, children }: ListItemProps) {
  return (
    <div
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
