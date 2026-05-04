import { createBrowserRouter, RouterProvider } from 'react-router';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './Layout';
import App from './App';
import Decks from './Decks/Decks';
import DeckDetail from './DeckDetail/DeckDetail';
import Search from './Search/Search';
import Playtest from './Playtest/Playtest';
import Login from './auth/Login';
import Register from './auth/Register';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorFallback />,
    children: [
      { index: true, element: <App /> },
      { path: 'decks', element: <Decks /> },
      { path: 'search', element: <Search /> },
      { path: 'decks/:deckId', element: <DeckDetail /> },
    ],
  },
  { path: 'decks/:deckId/playtest', element: <Playtest /> },
  { path: 'login', element: <Login /> },
  { path: 'register', element: <Register /> },
]);

// Simple error fallback for router errors
function ErrorFallback({ error }) {
  return (
    <div className="error-fallback">
      <h1>Something went wrong</h1>
      <p>{error?.message || 'An unexpected error occurred'}</p>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ErrorBoundary>
);