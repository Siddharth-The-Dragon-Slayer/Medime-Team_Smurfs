export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b p-4">
              <h1 className="text-2xl font-semibold text-gray-900">AI Voice Assistant</h1>
              <p className="text-gray-600 mt-1">
                Talk to your AI health assistant for personalized medication guidance
              </p>
            </div>

            <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
              <div className="text-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Start a Voice Conversation</h2>
                <p className="text-gray-600">
                  Click the microphone below to begin talking with your AI health assistant
                </p>
              </div>

              {/* ElevenLabs Conversational AI Widget */}
              <elevenlabs-convai agent-id="agent_0001k5ka2z29ffktyqfx17j43k9v"></elevenlabs-convai>

              <p className="text-xs text-gray-500 mt-6 text-center max-w-md">
                This AI voice assistant provides general information only. Always consult your healthcare provider for
                medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
    </div>
  )
}
