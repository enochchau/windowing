import { ListItem } from "./ListItem";
import { VirtualList } from "./VirtualList";

const itemData = Array.from({ length: 200 }, (_, i) => `I ${i}`);

export function ListDemo() {
  return (
    <VirtualList
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
    />
  );
}
