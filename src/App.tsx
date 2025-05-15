import { VirtualGrid } from "./VirtualGrid";
import { VirtualList } from "./VirtualList";

const itemData = Array.from({ length: 1000 }, (_, i) => `I ${i}`);

const rows = 100;
const cols = 100;
const cellData: string[][] = [];

for (let i = 0; i < rows; i++) {
  cellData[i] = [];
  for (let j = 0; j < cols; j++) {
    cellData[i][j] = `I ${i} ${j}`;
  }
}

export function App() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <div style={{ outline: "1px solid #999" }}>
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
      <div style={{ outline: "1px solid #999" }}>
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
          itemRenderer={({ rowIndex, columnIndex, isSticky }) => (
            <ListItem isSticky={isSticky}>
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
}
function ListItem({ isSticky, children }: ListItemProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "1px solid #999",
        background: isSticky ? "#888" : "white",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
