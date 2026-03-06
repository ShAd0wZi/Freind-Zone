import { motion } from "framer-motion";
import { Player } from "@/lib/gameData";
import AvatarDisplay from "@/components/AvatarDisplay";

interface GameOverProps {
  players: Player[];
  onPlayAgain: () => void;
}

export default function GameOver({ players, onPlayAgain }: GameOverProps) {
  const sorted = [...players].sort((a, b) => b.coins - a.coins);
  const winner = sorted[0];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 8, delay: 0.2 }}
        className="text-center"
      >
        <p className="text-7xl">👑</p>
        <h1 className="mt-4 font-display text-5xl font-black text-gold-glow md:text-7xl">
          {winner.name}
        </h1>
        <p className="mt-2 font-display text-2xl text-foreground/60">WINS THE HEIST</p>
        <p className="mt-1 font-mono text-xl font-bold text-primary">{winner.coins} coins</p>
      </motion.div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md space-y-2"
      >
        {sorted.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 + i * 0.1 }}
            className={`flex items-center justify-between rounded-xl px-5 py-4 ${
              i === 0 ? "card-heist shadow-gold" : "bg-secondary/30"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="font-mono text-sm text-muted-foreground">#{i + 1}</span>
              <AvatarDisplay avatar={p.avatar} size="md" name={p.name} />
              <span className="font-bold">{p.name}</span>
            </span>
            <span className="font-mono font-bold text-primary">{p.coins}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPlayAgain}
        className="bg-gold-gradient rounded-xl px-10 py-4 font-display text-xl font-black text-primary-foreground shadow-gold"
      >
        PLAY AGAIN 🎭
      </motion.button>
    </div>
  );
}
