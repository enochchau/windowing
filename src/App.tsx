import { Link, Route, Router, Switch } from "wouter";
import css from "./App.module.css";
import { GridDemo } from "./GridDemo";
import { ListDemo } from "./ListDemo";
import { CsvViewer } from "./CsvViewer";
import { useHashLocation } from "wouter/use-hash-location";

export function App() {
  return (
    <Router hook={useHashLocation}>
      <Nav />
      <Switch>
        <Route path="/" component={Grid} />
        <Route path="/list" component={List} />
        <Route path="/csv" component={CsvViewer} />
      </Switch>
    </Router>
  );
}

const Grid = () => {
  return (
    <div className={css["app-container"]}>
      <GridDemo />
    </div>
  );
};

const List = () => {
  return (
    <div className={css["app-container"]}>
      <ListDemo />
    </div>
  );
};

const Nav = () => {
  return (
    <nav className={css["nav-container"]}>
      <Link href="/">Grid Demo</Link>
      <Link href="/list">List Demo</Link>
      <Link href="/csv">Csv Viewer</Link>
    </nav>
  );
};
