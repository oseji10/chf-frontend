import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./app/App";
import StateProvider from "./app/components/StateProvider";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { applyMiddleware, compose, createStore } from "redux";
import rootReducer from "./app/redux";
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from "redux-thunk";
import ErrorBoundary from "./app/components/errorBoundary/errorBoundary";
import { createTheme, ThemeProvider } from "@material-ui/core";
import { storeConfig } from './app/redux/index';
import AuthContext from "./app/contexts/auth.context";

// const store = createStore(rootReducer,compose(applyMiddleware(thunk), composeWithDevTools()))
export const store = createStore(rootReducer, applyMiddleware(thunk))
const theme = createTheme();

ReactDOM.render(
  <React.StrictMode>

    <Provider store={storeConfig}>
      <Provider store={store}>
        <AuthContext.Provider value={storeConfig.getState().auth}>
          <StateProvider>
            <ErrorBoundary>
              <ThemeProvider theme={theme}>
                <App />
              </ThemeProvider>
            </ErrorBoundary>
          </StateProvider>
        </AuthContext.Provider>

      </Provider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// EMBED TAWK SCRIPT
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
(function () {
  var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
  s1.async = true;
  s1.src = 'https://embed.tawk.to/60ee7056649e0a0a5ccc1971/1fahmdkhe';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();

// END EMBED TAWK SCRIPT

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
