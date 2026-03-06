import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player, Challenge } from "@/lib/gameData";
import AvatarDisplay from "@/components/AvatarDisplay";

interface BiddingPhaseProps {
  players: Player[];
  challenge: Challenge;
  currentPlayerIndex: number;
  onPlaceBid: (playerId: string, amount: number) => void;
}

export default function BiddingPhase({ players, challenge, currentPlayerIndex, onPlaceBid }: BiddingPhaseProps) {
  const player = players[currentPlayerIndex];
  const [bid, setBid] = useState(50);

  if (!player) return null;

  const minBid = 0;
  const maxBid = player.coins;

  const handleSubmit = () => {
    onPlaceBid(player.id, bid);
    setBid(50);
  };

  const presets = [50, 100, 200, Math.round(challenge.baseValue * 0.5), challenge.baseValue];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm uppercase tracking-[0.3em] text-muted-foreground"
      >
        Pass phone to...
      </motion.p>

      <AnimatePresence mode="wait">
        <motion.div
          key={player.id}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          className="w-full max-w-md"
        >
          <div className="card-heist rounded-2xl p-6 text-center">
            <AvatarDisplay avatar={player.avatar} size="2xl" name={player.name} />
            <h3 className="mt-2 font-display text-3xl font-black text-gold-glow">
              {player.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              💰 {player.coins} coins available
            </p>

            <div className="mt-6">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">
                Your bid for "{challenge.title}"
              </p>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setBid(Math.max(minBid, bid - 50))}
                  className="rounded-lg bg-secondary px-4 py-2 text-xl font-bold text-foreground"
                >
                  −
                </button>
                <motion.span
                  key={bid}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="w-24 text-center font-display text-4xl font-black text-primary"
                >
                  {bid}
                </motion.span>
                <button
                  onClick={() => setBid(Math.min(maxBid, bid + 50))}
                  className="rounded-lg bg-secondary px-4 py-2 text-xl font-bold text-foreground"
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min={minBid}
                max={maxBid}
                step={10}
                value={bid}
                onChange={e => setBid(Number(e.target.value))}
                className="mt-4 w-full accent-primary"
              />

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {presets.filter(p => p <= maxBid && p > 0).map(p => (
                  <button
                    key={p}
                    onClick={() => setBid(p)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                      bid === p
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="bg-gold-gradient mt-6 w-full rounded-xl py-4 font-display text-lg font-black text-primary-foreground shadow-gold"
            >
              LOCK IN BID 🔒
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
        {players.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i < currentPlayerIndex ? "bg-primary" : i === currentPlayerIndex ? "bg-primary animate-pulse" : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
