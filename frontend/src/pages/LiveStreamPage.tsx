import { useParams } from 'react-router-dom'

function LiveStreamPage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Live Stream - Course {id}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Live streaming will be implemented after database setup. This will include:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li>• WebRTC video streaming</li>
          <li>• Real-time chat during stream</li>
          <li>• Screen sharing capabilities</li>
          <li>• Interactive Q&A sessions</li>
        </ul>
      </div>
    </div>
  )
}

export default LiveStreamPage