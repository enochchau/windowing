import { ListItem } from "./ListItem";
import css from "./ListDemo.module.css";
import { useVirtualList } from "./useVirtualList";
import { VirtualList } from "./VirtualList";

const itemData = Array.from({ length: 200 }, (_, i) => `I ${i}`);

export function ListDemo() {
  const { listProps, scrollToItem } = useVirtualList({
    itemCount: itemData.length,
    itemHeight: (index) => {
      if (index % 5 === 0) return 30;
      if (index % 2 === 0) return 40;
      return 50;
    },
    height: 400,
    stickyItemCount: 1,
  });

  const scrollIndex = 58;

  return (
    <div className={css["container"]}>
      <button onClick={() => scrollToItem(scrollIndex)}>
        Scroll to {scrollIndex} - Start
      </button>
      <button onClick={() => scrollToItem(scrollIndex, { block: "center" })}>
        Scroll to {scrollIndex} - Center
      </button>
      <button onClick={() => scrollToItem(scrollIndex, { block: "end" })}>
        Scroll to {scrollIndex} - End
      </button>
      <VirtualList
        {...listProps}
        width={400}
        overflowCount={3}
        itemRenderer={({ index, isSticky }) => (
          <ListItem
            isSticky={isSticky}
            style={{ background: scrollIndex === index ? "yellow" : undefined }}
          >
            {itemData[index]}
          </ListItem>
        )}
      />
    </div>
  );
}
