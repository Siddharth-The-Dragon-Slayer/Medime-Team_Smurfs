export default function VitalsLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    {/* Animated heartbeat effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-blue-500/20 animate-ping"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-blue-500/40 animate-pulse"></div>
                    </div>

                    {/* Spinner */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                </div>

                <div className="mt-8 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">Loading Vital Signs</h2>
                    <p className="text-gray-600">Connecting to sensors and preparing data...</p>
                </div>

                {/* Loading skeleton hints */}
                <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="h-20 bg-white/50 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-white/50 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-white/50 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-white/50 rounded-lg animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
