import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ProtectedRoute } from "./ProtectedRoute";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Layout from "../components/layout/Layout";
import { useMemo } from "react";
import DataEntryPage from "../pages/DataEntryPage"; // Make sure to import your DataEntryPage

// Define public routes accessible to all users
const routesForPublic = [
    {
        path: "/service",
        element: <div>Service Page</div>,
    },
    {
        path: "/about-us",
        element: <div>About Us</div>,
    },
];

// Define routes accessible only to authenticated users
const routesForAuthenticatedOnly = [
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                path: "/",
                element: <Layout />,
            },
            {
                path: "/dashboard",
                element: <Layout />,
            },
            {
                path: "/data-entry",  // Add this route
                element: <DataEntryPage />,
            },
            {
                path: "/logout",
                element: <Logout />,
            },
        ],
    },
];

// Define routes accessible only to non-authenticated users
const routesForNotAuthenticatedOnly = [
    {
        path: "/",
        element: <Login />
    },
];

// Catch-all route for invalid paths
const fallbackRoute = [
    {
        path: "*",
        element: <div>Page not found! Redirecting...</div>,
        loader: async () => {
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
            return null;
        },
    },
];

const Routes = () => {
    const { isAuthenticated } = useAuth();
    
    // Use useMemo to recreate the router when isAuthenticated changes
    const router = useMemo(() => {
        return createBrowserRouter([
            ...routesForPublic,
            ...(!isAuthenticated ? routesForNotAuthenticatedOnly : []),
            ...(isAuthenticated ? routesForAuthenticatedOnly : []),
            ...fallbackRoute,
        ]);
    }, [isAuthenticated]); // Recreate router when isAuthenticated changes

    return <RouterProvider router={router} />;
};

export default Routes;