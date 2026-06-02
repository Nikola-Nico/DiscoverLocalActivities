import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import InfiniteScroll from './tests/InfiniteScroll.tsx'
import Cards from './tests/Cards.tsx'
import NotFoundPage from './NotFoundPage.tsx'
// import { createBrowserRouter, RouterProvider } from 'react-router-dom'



// const router = createBrowserRouter([
//   {path: "/", element: <App />},
//   {path: "/infinite-scroll", element: <InfiniteScroll />},
//   {path: "/cards", element: <Cards />},
//   {path: "*", element: <NotFoundPage />}

// ]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
