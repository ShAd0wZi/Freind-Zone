import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, STARTING_COINS } from "@/lib/gameData";
import { getDefaultAvatarByIndex } from "@/lib/avatarUtils";
import AvatarDisplay from "@/components/AvatarDisplay";
import { HowToPlay } from "./HowToPlay";

interface LobbyProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onRemovePlayer: (id: string) => void;
  onStartGame: () => void;
}

export default function Lobby({ players, onAddPlayer, onRemovePlayer, onStartGame }: LobbyProps) {
  const [name, setName] = useState("");

  const addPlayer = () => {
    if (!name.trim() || players.length >= 8) return;
    const player: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      coins: STARTING_COINS,
      isSaboteur: false,
      avatar: getDefaultAvatarByIndex(players.length),
      currentBid: 0,
      isReady: false,
    };
    onAddPlayer(player);
    setName("");
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
        <p className="mt-4 text-sm text-muted-foreground">
          Bid. Bluff. Betray. — 5-8 players
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card-heist rounded-xl p-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addPlayer()}
              placeholder="Enter player name..."
              maxLength={15}
              className="flex-1 rounded-lg border border-border bg-secondary px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={addPlayer}
              disabled={!name.trim() || players.length >= 8}
              className="rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:shadow-gold disabled:opacity-30"
            >
              JOIN
            </button>
          </div>

          <AnimatePresence>
            <div className="mt-5 space-y-2">
              {players.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 30, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
                >
                  <span className="flex items-center gap-3">
                    <AvatarDisplay avatar={p.avatar} size="md" name={p.name} />
                    <span className="font-bold">{p.name}</span>
                  </span>
                  <button
                    onClick={() => onRemovePlayer(p.id)}
                    className="text-muted-foreground transition-colors hover:text-accent"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {players.length < 3 && players.length > 0 && (
            <p className="mt-3 text-center text-sm text-muted-foreground">
              Need at least 3 players to start
            </p>
          )}
        </div>
      </motion.div>

      {players.length >= 3 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartGame}
          className="bg-gold-gradient rounded-xl px-12 py-4 font-display text-2xl font-black tracking-wider text-primary-foreground shadow-gold transition-all"
        >
          START GAME
        </motion.button>
      )}
    </motion.div>
  );
}
