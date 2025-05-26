import { ListItem } from "./ListItem";
import css from "./ListDemo.module.css";
import { useVirtualList, VirtualList } from "@windowing/core";
import { useState } from "react";

const itemData = Array.from({ length: 200 }, (_, i) => `I ${i}`);

export function ListDemo() {
  const [enableSticky, setEnableSticky] = useState(true);
  const { listProps, scrollToItem } = useVirtualList({
    itemCount: itemData.length,
    itemHeight: (index) => {
      if (index % 5 === 0) return 30;
      if (index % 2 === 0) return 40;
      return 50;
    },
    height: 400,
    stickyItemCount: enableSticky ? 3 : undefined,
  });

  const scrollIndex = 58;

  return (
    <div className={css["container"]}>
      <label>
        Enable Sticky
        <input
          type="checkbox"
          checked={enableSticky}
          onChange={(e) => setEnableSticky(e.currentTarget.checked)}
        />
      </label>
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
        overflowCount={3}
        width={400}
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
