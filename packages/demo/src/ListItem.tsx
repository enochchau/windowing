import css from "./ListItem.module.css";
// import { VirtualList } from "./VirtualList";
import { classNames } from "./classNames";

export interface ListItemProps {
  children: React.ReactNode;
  isSticky: boolean;
  isHovering?: boolean;
  style?: React.CSSProperties;
}
export function ListItem({
  style,
  isHovering,
  isSticky,
  children,
}: ListItemProps) {
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
