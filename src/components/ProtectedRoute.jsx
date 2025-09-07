import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ roles = [] }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="mt-4 text-lg font-medium text-gray-700">Authenticating...</p>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Check if route requires specific roles
    if (roles.length > 0 && !roles.includes(currentUser.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;