import { useParams } from 'react-router-dom'

function CoursePage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Khóa học {id}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">
          Nội dung khóa học sẽ được triển khai sau khi thiết lập cơ sở dữ liệu. Điều này sẽ bao gồm:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li>• Tài liệu và tài nguyên khóa học</li>
          <li>• Chat thời gian thực với bạn học</li>
          <li>• Nộp bài tập</li>
          <li>• Truy cập phiên học trực tiếp</li>
        </ul>
      </div>
    </div>
  )
}

export default CoursePage