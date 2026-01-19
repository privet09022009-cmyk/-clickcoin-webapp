import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// ====================== ГЛОБАЛЬНЫЕ СТИЛИ ======================
const globalStyles = `
  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    background: radial-gradient(circle at center, #0f172a, #020617 70%);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #fff;
    overflow: hidden;
  }

  ::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  .fade-in {
    animation: fadeIn 0.4s ease forwards;
    opacity: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Вставляем стили в <head>
const styleTag = document.createElement("style");
styleTag.innerHTML = globalStyles;
document.head.appendChild(styleTag);

// ====================== TELEGRAM WEBAPP INIT ======================
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// ====================== РЕНДЕР ======================
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="fade-in">
      <App />
    </div>
  </React.StrictMode>
);
