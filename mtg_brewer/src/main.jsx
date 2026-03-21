import { createBrowserRouter, RouterProvider } from "react-router";
import { createRoot } from "react-dom/client";
import Layout from "./Layout";
import App from "./App";
import Decks from "./Decks/Decks";
import DeckDetail from "./DeckDetail/DeckDetail";
import Search from "./Search/Search";
import Playtest from "./Playtest/Playtest";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "decks", element: <Decks /> },
      { path: "search", element: <Search /> },
      { path: "decks/:deckId", element: <DeckDetail /> },
      { path: "decks/:deckId/playtest", element: <Playtest /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />,
);
