export default function RootLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    {/* Medical cross icon with pulse */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-primary/10 animate-ping"></div>
                    </div>

                    {/* Spinner */}
                    <div className="relative flex items-center justify-center">
                        <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                </div>

                <div className="mt-12 space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-primary">MediMe</span>
                    </div>
                    <p className="text-gray-600 text-lg">Loading your health companion...</p>
                </div>

                {/* Progress bar */}
                <div className="mt-8 max-w-xs mx-auto">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
