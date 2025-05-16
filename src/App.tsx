import css from "./App.module.css";
import { GridDemo } from "./GridDemo";
import { ListDemo } from "./ListDemo";

export function App() {
  return (
    <div className={css["app-container"]}>
      <div>
        <GridDemo />
      </div>
      <div>
        <ListDemo />
      </div>
    </div>
  );
}
