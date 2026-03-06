import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/gameData";
import AvatarDisplay from "@/components/AvatarDisplay";

interface RoleRevealProps {
  players: Player[];
  saboteurId: string;
  onComplete: () => void;
}

export default function RoleReveal({ players, saboteurId, onComplete }: RoleRevealProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const current = players[currentIndex];
  const isSaboteur = current.id === saboteurId;

  const handleReveal = () => setRevealed(true);

  const handleNext = () => {
    setRevealed(false);
    if (currentIndex + 1 >= players.length) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm uppercase tracking-[0.3em] text-muted-foreground"
      >
        Pass the phone to...
      </motion.p>

      <motion.h2
        key={current.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-display text-4xl font-black text-gold-glow"
      >
        <AvatarDisplay avatar={current.avatar} size="xl" name={current.name} className="mx-auto" />
        <div className="mt-3">{current.name}</div>
      </motion.h2>

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.button
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReveal}
            className="mt-8 rounded-xl border-2 border-primary/40 px-10 py-5 font-bold text-primary transition-all hover:bg-primary/10"
          >
            👁 TAP TO SEE YOUR ROLE
          </motion.button>
        ) : (
          <motion.div
            key="role"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <div
              className={`card-heist rounded-2xl p-8 text-center ${
                isSaboteur ? "border-saboteur/50 shadow-[0_0_40px_-10px_hsl(var(--saboteur)/0.5)]" : "shadow-gold"
              }`}
              style={isSaboteur ? { borderColor: 'hsl(var(--saboteur))' } : {}}
            >
              <p className="text-6xl">{isSaboteur ? "🗡️" : "💰"}</p>
              <h3
                className={`mt-3 font-display text-3xl font-black ${
                  isSaboteur ? "text-saboteur" : "text-gold-glow"
                }`}
              >
                {isSaboteur ? "SABOTEUR" : "BIDDER"}
              </h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                {isSaboteur
                  ? "Make others overbid! If the highest bidder pays more than the challenge is worth, you steal their coins."
                  : "Bid wisely on challenges. Don't overbid — the Saboteur is watching. Try to figure out who they are!"}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground"
            >
              {currentIndex + 1 >= players.length ? "BEGIN ROUND →" : "NEXT PLAYER →"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex gap-2">
        {players.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-colors ${
              i <= currentIndex ? "bg-primary" : "bg-secondary"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
