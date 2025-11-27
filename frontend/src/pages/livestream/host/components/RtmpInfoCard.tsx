import { Button } from '@/components/ui/Button';
import { Copy, CheckCircle } from 'lucide-react';

interface RtmpInfoCardProps {
  serverUrl?: string | null;
  streamKey?: string | null;
  playbackUrl?: string | null;
  copied: boolean;
  onCopy: (value: string) => void;
}

export function RtmpInfoCard({ serverUrl, streamKey, playbackUrl, copied, onCopy }: RtmpInfoCardProps) {
  if (!serverUrl && !streamKey && !playbackUrl) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin RTMP / OBS</h2>

      <div className="space-y-3">
        {serverUrl && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Server URL</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={serverUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onCopy(serverUrl)}
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {streamKey && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Stream key</p>
            <p className="font-mono text-gray-900 break-words">{streamKey}</p>
          </div>
        )}

        {playbackUrl && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Playback URL (HLS)</p>
            <p className="font-mono text-gray-900 break-all">{playbackUrl}</p>
          </div>
        )}
      </div>
    </div>
  );
}

