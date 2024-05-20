import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./input.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./features/app/store";
import Loader from "./components/Loading";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <Suspense fallback={<Loader />}>
        <App />
      </Suspense>
    </Provider>
  </React.StrictMode>
);
