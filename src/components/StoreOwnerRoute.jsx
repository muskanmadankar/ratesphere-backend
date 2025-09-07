import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const StoreOwnerRoute = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-lg font-medium text-gray-700">Verifying store owner access...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (currentUser.role !== "store_owner") {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default StoreOwnerRoute;