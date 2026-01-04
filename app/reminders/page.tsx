import { ReminderSettings } from "@/components/reminder-settings"

export default function RemindersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ReminderSettings />
        </div>
      </div>
    </div>
  )
}
