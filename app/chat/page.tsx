export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b p-4">
              <h1 className="text-2xl font-semibold text-gray-900">AI Health Assistant</h1>
              <p className="text-gray-600 mt-1">Get personalized medication guidance and health advice</p>
            </div>

            <div className="h-96 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AI</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm max-w-md">
                    <p className="text-gray-800">
                      Hello! I'm your AI health assistant. I can help you with medication questions, schedule reminders,
                      and provide general health guidance. How can I assist you today?
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask about your medications, side effects, or health concerns..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This AI assistant provides general information only. Always consult your healthcare provider for medical
                advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
