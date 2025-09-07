import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, Loader2 } from "lucide-react";

const AdminRoute = () => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-white">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    <p className="text-lg font-medium text-gray-700">Verifying admin privileges...</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        // Redirect to login with return location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (currentUser.role !== "admin") {
        return (
            <Navigate 
                to="/unauthorized" 
                state={{ 
                    message: "Admin access required",
                    icon: <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                }} 
                replace 
            />
        );
    }

    return <Outlet />;
};

export default AdminRoute;