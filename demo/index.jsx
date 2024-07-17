import { createSignal, createEffect, createStore } from "../core";

function Greet(props) {
  return (
    <div>
      <h1>Hello, {`${props.name.firstName} ${props.name.lastName}`}</h1>
    </div>
  );
}

function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <div className="counter-container">
      <button onCLick={() => setCount(count() + 1)}>count : {count()}</button>
      <button onClick={() => setCount(count() + 2)}>double : {count()}</button>
    </div>
  );
}

function Timer() {
  const [time, setTime] = createSignal(0);
  setInterval(() => setTime(time() + 1), 1000);
  return <h1>time: {time()}</h1>;
}

function App() {
  const [show, setShow] = createSignal(true);
  const [upper, setUpper] = createSignal("");
  const name = createStore({ firstName: "john", lastName: "doe" });

  createEffect(() => {
    setUpper(`${name.firstName} ${name.lastName}`.toUpperCase());
  });

  return (
    <div className="app-container">
      <div className="toggle-container">
        {show() ? <Greet name={name} /> : null}
        <p style={{ color: "pink" }}>{upper()}</p>
        <button onClick={() => setShow(!show())}>toggle</button>
      </div>
      <div className="input-container">
        <input
          type="text"
          value={name.firstName}
          onInput={(e) => (name.firstName = e.target.value)}
        />
        <input
          type="text"
          value={name.lastName}
          onInput={(e) => (name.lastName = e.target.value)}
        />
      </div>
      <Counter />
      <Timer />
    </div>
  );
}

export default App;
