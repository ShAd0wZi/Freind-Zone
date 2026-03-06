import { motion } from "framer-motion";
import { Challenge } from "@/lib/gameData";

interface ChallengeRevealProps {
  challenge: Challenge;
  round: number;
  totalRounds: number;
  onStartBidding: () => void;
}

const difficultyColors: Record<string, string> = {
  easy: "text-success",
  medium: "text-primary",
  hard: "text-saboteur",
};

export default function ChallengeReveal({ challenge, round, totalRounds, onStartBidding }: ChallengeRevealProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm uppercase tracking-[0.3em] text-muted-foreground"
      >
        Round {round} of {totalRounds}
      </motion.p>

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateZ: -5 }}
        animate={{ scale: 1, opacity: 1, rotateZ: 0 }}
        transition={{ type: "spring", damping: 12 }}
        className="card-heist max-w-lg rounded-2xl p-8 text-center shadow-gold"
      >
        <p className={`text-xs font-bold uppercase tracking-widest ${difficultyColors[challenge.difficulty]}`}>
          {challenge.difficulty} challenge
        </p>
        <h2 className="mt-3 font-display text-4xl font-black text-gold-glow">
          {challenge.title}
        </h2>
        <p className="mt-4 text-foreground/80">
          {challenge.description}
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2">
          <span className="text-lg">💰</span>
          <span className="font-bold text-primary">Base Value: {challenge.baseValue}</span>
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStartBidding}
        className="bg-gold-gradient rounded-xl px-10 py-4 font-display text-xl font-black text-primary-foreground shadow-gold"
      >
        START BIDDING
      </motion.button>
    </div>
  );
}
