export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    {/* Animated pulse circles */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/20 animate-ping"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-primary/40 animate-pulse"></div>
                    </div>

                    {/* Spinner */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                </div>

                <div className="mt-8 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">Loading Dashboard</h2>
                    <p className="text-gray-600">Please wait while we prepare your health data...</p>
                </div>

                {/* Loading skeleton hints */}
                <div className="mt-8 space-y-3 max-w-md mx-auto">
                    <div className="h-3 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded-full animate-pulse w-5/6 mx-auto"></div>
                    <div className="h-3 bg-gray-200 rounded-full animate-pulse w-4/6 mx-auto"></div>
                </div>
            </div>
        </div>
    )
}
