import { useState } from "react";
import { motion } from "framer-motion";
import { defaultAvatarEmojis } from "@/lib/avatarUtils";
import { createRoom, joinRoom } from "@/lib/onlineGame";
import AvatarDisplay from "@/components/AvatarDisplay";
import { HowToPlay } from "./HowToPlay";

interface OnlineLobbyProps {
  onJoined: (roomId: string, playerId: string, roomCode: string, isHost: boolean, isSpectator: boolean) => void;
}

export default function OnlineLobby({ onJoined }: OnlineLobbyProps) {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [avatar, setAvatar] = useState(defaultAvatarEmojis[0].displayValue);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const result = await createRoom(name.trim(), avatar);
    setLoading(false);
    if (result) {
      onJoined(result.roomId, result.playerId, result.roomCode, true, false);
    } else {
      setError("Failed to create room. Try again!");
    }
  };

  const handleJoin = async () => {
    if (!name.trim() || !roomCode.trim()) return;
    setLoading(true);
    setError("");
    const result = await joinRoom(roomCode.trim(), name.trim(), avatar);
    setLoading(false);
    if (result) {
      onJoined(result.roomId, result.playerId, roomCode.toUpperCase(), false, result.isSpectator);
    } else {
      setError("Room not found!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 p-6"
    >
      <div className="fixed right-4 top-4 z-50 md:right-8 md:top-8">
        <HowToPlay />
      </div>

      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="text-center"
      >
        <h1 className="font-display text-6xl font-black tracking-tight text-gold-glow md:text-8xl">
          BETRAYAL
        </h1>
        <p className="font-display text-2xl tracking-widest text-foreground/60 md:text-3xl">
          AUCTION
        </p>
        <p className="mt-2 text-sm text-primary">ONLINE MULTIPLAYER</p>
      </motion.div>

      {mode === "menu" && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode("create")}
            className="bg-gold-gradient rounded-xl px-12 py-5 font-display text-xl font-black text-primary-foreground shadow-gold"
          >
            CREATE ROOM
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMode("join")}
            className="rounded-xl border-2 border-primary/40 px-12 py-5 font-display text-xl font-black text-primary transition-colors hover:bg-primary/10"
          >
            JOIN ROOM
          </motion.button>
        </motion.div>
      )}

      {(mode === "create" || mode === "join") && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md"
        >
          <div className="card-heist rounded-xl p-6">
            <button
              onClick={() => {
                setMode("menu");
                setError("");
              }}
              className="mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              Back
            </button>

            <h3 className="font-display text-xl font-bold text-foreground">
              {mode === "create" ? "Create a Room" : "Join a Room"}
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={15}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-widest text-muted-foreground">
                  Choose Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {defaultAvatarEmojis.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setAvatar(option.displayValue)}
                      title={option.label}
                      className={`rounded-lg p-2 text-2xl transition-all ${avatar === option.displayValue ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary hover:bg-secondary/80"
                        }`}
                    >
                      {option.displayValue}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "join" && (
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="ABCDE"
                    maxLength={5}
                    className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    If the game already started, you will join as a spectator.
                  </p>
                </div>
              )}

              {error && <p className="text-center text-sm text-accent">{error}</p>}

              <button
                onClick={mode === "create" ? handleCreate : handleJoin}
                disabled={loading || !name.trim() || (mode === "join" && roomCode.length < 5)}
                className="bg-gold-gradient w-full rounded-xl py-4 font-display text-lg font-black text-primary-foreground shadow-gold transition-all disabled:opacity-30"
              >
                {loading ? "..." : mode === "create" ? "CREATE & SHARE CODE" : "JOIN / SPECTATE"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
