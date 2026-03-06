import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSaboteurRevealSound } from "@/lib/soundEffects";

interface RoleRevealOnlineProps {
  isSaboteur: boolean;
  playerName: string;
  isHost: boolean;
  onDone: () => void;
  onReady: () => void;
  isAllReady: boolean;
}

export default function RoleRevealOnline({ isSaboteur, playerName, isHost, onDone, onReady, isAllReady }: RoleRevealOnlineProps) {
  const [revealed, setRevealed] = useState(false);
  const [showDramatic, setShowDramatic] = useState(false);

  const handleReveal = () => {
    setShowDramatic(true);
    setTimeout(() => {
      playSaboteurRevealSound(isSaboteur);
      setRevealed(true);
      setShowDramatic(false);
      onReady();
    }, isSaboteur ? 1800 : 1200);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden p-6">
      <AnimatePresence>
        {showDramatic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0, 0.5, 0] }}
            transition={{ duration: 1.8, times: [0, 0.2, 0.4, 0.6, 1] }}
            className="fixed inset-0 z-0"
            style={{
              background: isSaboteur
                ? "radial-gradient(circle, hsl(var(--saboteur) / 0.4), transparent)"
                : "radial-gradient(circle, hsl(var(--gold-glow) / 0.3), transparent)",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDramatic && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.5, 1], rotate: [-180, 10, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="fixed inset-0 z-10 flex items-center justify-center"
          >
            <motion.p animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 0.5, repeat: 2 }} className="text-8xl">
              {isSaboteur ? "SAB" : "BID"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-20 text-sm uppercase tracking-[0.3em] text-muted-foreground">
        {playerName}'s secret role
      </motion.p>

      <AnimatePresence mode="wait">
        {!revealed && !showDramatic ? (
          <motion.button
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReveal}
            className="relative z-20 rounded-xl border-2 border-primary/40 px-10 py-5 font-bold text-primary transition-all hover:bg-primary/10"
          >
            <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              TAP TO SEE YOUR ROLE
            </motion.span>
          </motion.button>
        ) : revealed ? (
          <motion.div
            key="role"
            initial={{ rotateY: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 100 }}
            className="relative z-20 flex flex-col items-center gap-4"
          >
            <motion.div
              initial={{ y: 0 }}
              animate={
                isSaboteur
                  ? {
                    boxShadow: [
                      "0 0 20px -5px hsl(var(--saboteur) / 0.3)",
                      "0 0 60px -5px hsl(var(--saboteur) / 0.6)",
                      "0 0 20px -5px hsl(var(--saboteur) / 0.3)",
                    ],
                  }
                  : {}
              }
              transition={isSaboteur ? { duration: 2, repeat: Infinity } : {}}
              className={`card-heist rounded-2xl p-8 text-center ${isSaboteur ? "border-[hsl(var(--saboteur))]" : "shadow-gold"}`}
              style={isSaboteur ? { borderColor: "hsl(var(--saboteur))" } : {}}
            >
              <motion.p initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.2, duration: 0.5 }} className="text-6xl">
                {isSaboteur ? "SABOTEUR" : "BIDDER"}
              </motion.p>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`mt-3 font-display text-3xl font-black ${isSaboteur ? "text-saboteur" : "text-gold-glow"}`}
              >
                {isSaboteur ? "SABOTEUR" : "BIDDER"}
              </motion.h3>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-2 max-w-xs text-sm text-muted-foreground">
                {isSaboteur
                  ? "Make others overbid. If the highest bidder pays more than the challenge is worth, you steal their coins."
                  : "Bid wisely on challenges. Do not overbid. The Saboteur is watching."}
              </motion.p>
            </motion.div>

            {isHost && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileTap={isAllReady ? { scale: 0.95 } : {}}
                onClick={isAllReady ? onDone : undefined}
                className={`rounded-xl px-8 py-3 font-bold transition-colors ${isAllReady ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
              >
                {isAllReady ? "CONTINUE" : "WAITING FOR PLAYERS..."}
              </motion.button>
            )}
            {!isHost && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-muted-foreground">
                Waiting for host to continue...
              </motion.p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
