import { DoctorNavbar } from "@/components/doctor-navbar"
import { PatientVitalsOverview } from "@/components/patient-vitals-overview"

export default async function DoctorDashboardPage() {
  // For now, we'll use a mock approach since we're having database issues
  // In a real app, this would check the database
  
  // Mock doctor data
  const mockDoctor = {
    id: "doctor-123",
    name: "Dr. Test Doctor",
    email: "doctor@test.com",
    specialization: "General Practice",
    hospital_affiliation: "Test Hospital",
    license_number: "MD123456",
    phone: "+1234567890"
  }

  // Mock patient relationships (empty for now)
  const mockPatientRelationships: any[] = []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <DoctorNavbar doctor={mockDoctor} />

      <div className="pt-16 p-6 space-y-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, Dr. {mockDoctor.name}
            </h1>
            <p className="text-gray-600">
              {mockDoctor.specialization} • {mockDoctor.hospital_affiliation}
            </p>
          </div>

          <PatientVitalsOverview 
            doctor={mockDoctor} 
            patientRelationships={mockPatientRelationships} 
          />
        </div>
      </div>
    </div>
  )
}