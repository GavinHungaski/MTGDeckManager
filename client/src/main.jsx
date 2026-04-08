import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./auth/AuthContext";
import Layout from "./Layout";
import App from "./App";
import Decks from "./Decks/Decks";
import DeckDetail from "./DeckDetail/DeckDetail";
import Search from "./Search/Search";
import Playtest from "./Playtest/Playtest";
import Login from "./auth/Login";
import Register from "./auth/Register";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "decks", element: <Decks /> },
      { path: "search", element: <Search /> },
      { path: "decks/:deckId", element: <DeckDetail /> },
    ],
  },
  { path: "decks/:deckId/playtest", element: <Playtest /> },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
]);

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>,
);
