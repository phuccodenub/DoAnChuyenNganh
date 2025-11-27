interface ConnectionNoticeProps {
  isConnected: boolean;
}

export function ConnectionNotice({ isConnected }: ConnectionNoticeProps) {
  if (isConnected) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
      Đang kết nối tới server real-time...
    </div>
  );
}

