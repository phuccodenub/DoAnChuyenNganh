import type { OnlineUser } from '@/services/socketService'

interface OnlineUsersProps {
  users: OnlineUser[]
  isVisible: boolean
  onToggle: () => void
}

function OnlineUsers({ users, isVisible, onToggle }: OnlineUsersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400'
      case 'away':
        return 'bg-yellow-400'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'bg-purple-100 text-purple-700'
      case 'student':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="bg-white border-l border-gray-200">
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <span className="text-green-500 mr-2">🟢</span>
            Online ({users.length})
          </h3>
          <button className="text-gray-400 hover:text-gray-600">
            <span className={`transition-transform ${isVisible ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      </div>

      {/* Users List */}
      {isVisible && (
        <div className="p-3 space-y-3 max-h-96 overflow-y-auto">
          {users.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-sm text-gray-500">No one is online</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 capitalize">
                    {user.status}
                  </p>
                </div>

                {user.role === 'instructor' && (
                  <div className="text-yellow-500" title="Instructor">
                    ⭐
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Stats */}
      {isVisible && users.length > 0 && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-purple-600">
                {users.filter(u => u.role === 'instructor').length}
              </div>
              <div className="text-gray-500">Instructors</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-600">
                {users.filter(u => u.role === 'student').length}
              </div>
              <div className="text-gray-500">Students</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnlineUsers