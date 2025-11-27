/**
 * ReactionOverlay Component
 * 
 * Hiển thị emoji reactions bay lên từ dưới như Facebook Live
 * Mỗi emoji có vị trí ngẫu nhiên và bay lên với đường cong tự nhiên
 */

import { useEffect, useState } from 'react';

interface Reaction {
  id: string;
  emoji: string;
  startX: number; // Vị trí bắt đầu ngẫu nhiên (0-100%)
  endX: number; // Vị trí kết thúc (có thể lệch một chút)
  timestamp: number;
}

interface ReactionOverlayProps {
  reactions: Array<{ emoji: string; userName: string }>;
}

export function ReactionOverlay({ reactions }: ReactionOverlayProps) {
  const [activeReactions, setActiveReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (reactions.length === 0) return;

    // Get the latest reaction
    const latestReaction = reactions[reactions.length - 1];
    
    // Tạo vị trí ngẫu nhiên cho mỗi emoji
    // Vị trí bắt đầu: từ 20% đến 80% chiều rộng (tránh sát mép)
    const startX = Math.random() * 60 + 20;
    // Vị trí kết thúc: lệch một chút so với vị trí bắt đầu (tạo đường cong)
    const endX = startX + (Math.random() * 20 - 10); // Lệch -10% đến +10%
    
    // Create new reaction
    const newReaction: Reaction = {
      id: `reaction-${Date.now()}-${Math.random()}`,
      emoji: latestReaction.emoji,
      startX,
      endX,
      timestamp: Date.now(),
    };

    // Add to active reactions (keep max 15 reactions)
    setActiveReactions((prev) => {
      const updated = [...prev, newReaction];
      return updated.slice(-15); // Keep only last 15
    });

    // Remove after animation completes (4 seconds)
    setTimeout(() => {
      setActiveReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 4000);
  }, [reactions]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {activeReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="reaction-emoji-float"
          style={{
            left: `${reaction.startX}%`,
            '--offset-x': `${reaction.endX - reaction.startX}%`,
          } as React.CSSProperties}
        >
          <span className="text-3xl md:text-4xl select-none drop-shadow-lg">
            {reaction.emoji}
          </span>
        </div>
      ))}
    </div>
  );
}

