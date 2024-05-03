import "./App.css";
import Intercept from "./containers/Intercept";
import Interceptor from "./containers/Interceptor";

function App() {
  return (
    <div className="tabset">
      <input
        type="radio"
        name="tabset"
        id="tab1"
        aria-controls="marzen"
        checked
      />
      <label htmlFor="tab1">INTERCEPTOR</label>

      <input type="radio" name="tabset" id="tab2" aria-controls="rauchbier" />
      <label htmlFor="tab2">INTERCEPT</label>

      <div className="tab-panels">
        <section id="marzen" className="tab-panel">
          <Interceptor />
        </section>
        <section id="rauchbier" className="tab-panel">
          <Intercept />
        </section>
      </div>
    </div>
  );
}

export default App;
