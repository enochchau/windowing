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
        <Route path="/" component={Demo} />
        <Route path="/csv" component={CsvViewer} />
      </Switch>
    </Router>
  );
}

const Demo = () => {
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
};

const Nav = () => {
  return (
    <nav className={css["nav-container"]}>
      <Link href="/">Demo</Link>
      <Link href="/csv">Csv Viewer</Link>
    </nav>
  );
};
