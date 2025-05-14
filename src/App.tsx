import { VirtualList } from "./VirtualList";

const itemData = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  data: {
    label: `Item ${i + 1}`,
  },
}));

export function App() {
  return (
    <div style={{ outline: "1px solid #999" }}>
      <VirtualList
        itemData={itemData}
        overflowCount={3}
        itemHeight={30}
        height={400}
        width={400}
        itemRenderer={({ data, isSticky }) => (
          <ListItem isSticky={isSticky}>{data.label}</ListItem>
        )}
        stickyRowCount={3}
      />
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
