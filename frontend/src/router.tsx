import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminEventsPage from "./pages/AdminEventsPage";
import AdminResourcesPage from "./pages/AdminResourcesPage";
import BookingDetailPage from "./pages/BookingDetailPage";
import BookingPage from "./pages/BookingPage";
import EventDetailPage from "./pages/EventDetailPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";

export const routes = [
  {
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/events/:eventId", element: <EventDetailPage /> },
          { path: "/resources/:resourceId", element: <ResourceDetailPage /> },
          {
            path: "/resources/:resourceId/book",
            element: <BookingPage />,
          },
          { path: "/my-bookings", element: <MyBookingsPage /> },
          { path: "/my-bookings/:bookingId", element: <BookingDetailPage /> },
          { path: "/admin/bookings", element: <AdminBookingsPage /> },
          { path: "/admin/resources", element: <AdminResourcesPage /> },
          { path: "/admin/events", element: <AdminEventsPage /> },
        ],
      },
      { path: "/login", element: <LoginPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);