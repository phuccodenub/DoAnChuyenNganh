import { useParams } from 'react-router-dom'

function CoursePage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Course {id}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Course content will be implemented after database setup. This will include:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li>• Course materials and resources</li>
          <li>• Real-time chat with classmates</li>
          <li>• Assignment submissions</li>
          <li>• Live session access</li>
        </ul>
      </div>
    </div>
  )
}

export default CoursePage