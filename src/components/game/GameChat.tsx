import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import AvatarDisplay from "@/components/AvatarDisplay";

interface GameChatProps {
  roomId: string;
  playerId: string;
  playerName: string;
  avatar: string;
}

const QUICK_REACTIONS = ["😂", "🔥", "💀", "👀", "🤡", "💰", "🗡️", "😈"];

export default function GameChat({ roomId, playerId, playerName, avatar }: GameChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("game_messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(50);
      if (data) setMessages(data);
    };
    fetchMessages();

    const channel = supabase
      .channel(`chat-${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "game_messages",
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        setMessages(prev => [...prev.slice(-49), payload.new as any]);
        if (!isOpen) setUnread(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string, isReaction = false) => {
    if (!text.trim()) return;
    await supabase.from("game_messages").insert({
      room_id: roomId,
      player_id: playerId,
      player_name: playerName,
      avatar,
      message: text.trim(),
      is_reaction: isReaction,
    });
    setInput("");
  };

  return (
    <>
      {/* Floating reactions bar - always visible */}
      <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-1.5">
        {QUICK_REACTIONS.map(emoji => (
          <motion.button
            key={emoji}
            whileTap={{ scale: 1.4, y: -10 }}
            onClick={() => sendMessage(emoji, true)}
            className="rounded-full bg-secondary/80 p-2 text-lg backdrop-blur-sm transition-colors hover:bg-secondary"
          >
            {emoji}
          </motion.button>
        ))}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
          className="relative rounded-full bg-primary/20 p-2 text-lg backdrop-blur-sm transition-colors hover:bg-primary/30"
        >
          💬
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {unread}
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating reaction bubbles */}
      <AnimatePresence>
        {messages.slice(-3).filter(m => m.is_reaction && Date.now() - new Date(m.created_at).getTime() < 3000).map(m => (
          <motion.div
            key={m.id}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -120, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 text-4xl"
          >
            {m.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md rounded-t-2xl border border-border bg-card/95 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="font-display text-sm font-bold text-gold-glow">CHAT</span>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div ref={scrollRef} className="h-48 overflow-y-auto p-3 space-y-2">
              {messages.filter(m => !m.is_reaction).map(m => (
                <div key={m.id} className={`flex items-start gap-2 ${m.player_id === playerId ? "flex-row-reverse" : ""}`}>
                  <AvatarDisplay avatar={m.avatar} size="sm" name={m.player_name} />
                  <div className={`rounded-lg px-3 py-1.5 text-sm ${m.player_id === playerId ? "bg-primary/20 text-foreground" : "bg-secondary text-foreground"}`}>
                    <span className="block text-[10px] font-bold text-muted-foreground">{m.player_name}</span>
                    {m.message}
                  </div>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-xs text-muted-foreground">No messages yet...</p>}
            </div>

            <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Trash talk..."
                maxLength={200}
                className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Send</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
