import { useEffect, useState } from 'react';
import { livestreamApi } from '@/services/api/livestream.api';
import type { RTCIceServer } from 'webrtc';

/**
 * Hook to fetch and merge ICE servers from Twilio NTS and session config
 * 
 * @param sessionIceServers - ICE servers from session's webrtc_config (optional)
 * @param enabled - Whether to fetch from Twilio (default: true)
 * @returns Merged ICE servers array
 */
export function useIceServers(
  sessionIceServers?: RTCIceServer[],
  enabled: boolean = true
): RTCIceServer[] | undefined {
  const [twilioIceServers, setTwilioIceServers] = useState<RTCIceServer[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let mounted = true;

    const fetchTwilioIceServers = async () => {
      try {
        setIsLoading(true);
        const response = await livestreamApi.getIceServers();
        
        if (mounted && response.iceServers) {
          // Convert backend format to WebRTC format
          const converted: RTCIceServer[] = response.iceServers.map((server) => ({
            urls: server.urls,
            username: server.username,
            credential: server.credential,
          }));
          setTwilioIceServers(converted);
        }
      } catch (error) {
        console.error('[useIceServers] Failed to fetch Twilio ICE servers:', error);
        // On error, don't set twilioIceServers, will fallback to session config or defaults
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTwilioIceServers();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  // Merge strategy:
  // 1. If Twilio servers are available, use them (they include STUN + TURN)
  // 2. Otherwise, use session config if available
  // 3. Otherwise, return undefined (components will use defaults)
  
  if (twilioIceServers && twilioIceServers.length > 0) {
    return twilioIceServers;
  }

  if (sessionIceServers && sessionIceServers.length > 0) {
    return sessionIceServers;
  }

  return undefined;
}

