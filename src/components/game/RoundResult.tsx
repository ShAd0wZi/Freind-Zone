import { motion } from "framer-motion";
import { RoundResult as RoundResultType, Player } from "@/lib/gameData";
import AvatarDisplay from "@/components/AvatarDisplay";

interface RoundResultProps {
  result: RoundResultType;
  players: Player[];
  onNextRound: () => void;
  isLastRound: boolean;
}

export default function RoundResult({ result, players, onNextRound, isLastRound }: RoundResultProps) {
  const saboteur = players.find(p => p.id === result.saboteurId);
  const highBidder = players.find(p => p.id === result.highestBidder);
  const sortedBids = [...result.bids].sort((a, b) => b.bid - a.bid);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <motion.h2
        initial={{ scale: 0, rotateZ: -10 }}
        animate={{ scale: 1, rotateZ: 0 }}
        transition={{ type: "spring", damping: 10 }}
        className="font-display text-4xl font-black text-gold-glow"
      >
        ROUND RESULTS
      </motion.h2>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="card-heist w-full max-w-md rounded-2xl p-6"
      >
        <p className="text-center text-sm text-muted-foreground">
          Challenge: <span className="font-bold text-foreground">{result.challenge.title}</span>
          {" "}(Base Value: {result.challenge.baseValue})
        </p>

        <div className="mt-4 space-y-2">
          {sortedBids.map((b, i) => {
            const bidder = players.find(p => p.id === b.playerId);
            return (
            <motion.div
              key={b.playerId}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                b.playerId === result.highestBidder
                  ? "bg-primary/20 ring-1 ring-primary/40"
                  : "bg-secondary/30"
              }`}
            >
              {i === 0 ? "👑" : ""}
              {bidder && <AvatarDisplay avatar={bidder.avatar} size="sm" />}
              <span className="font-bold">{b.playerName}</span>
              <span className="ml-auto font-mono font-bold text-primary">{b.bid}</span>
            </motion.div>
            );
          })}}
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="card-heist rounded-2xl p-6 text-center"
        style={{ borderColor: 'hsl(var(--saboteur))' }}
      >
        <p className="text-5xl">🗡️</p>
        <p className="mt-2 font-display text-2xl font-black text-saboteur">
          {saboteur?.name} was the SABOTEUR!
        </p>
        {highBidder && (
          <p className="mt-2 text-sm text-muted-foreground">
            {result.saboteurCaught ? (
              <span className="text-success">
                ✅ {highBidder.name} bid wisely (under base value). Saboteur loses coins!
              </span>
            ) : (
              <span className="text-saboteur">
                💀 {highBidder.name} overbid! The Saboteur steals their coins!
              </span>
            )}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="w-full max-w-md"
      >
        <h3 className="mb-3 text-center font-display text-lg font-bold text-muted-foreground">STANDINGS</h3>
        <div className="space-y-1">
          {[...players].sort((a, b) => b.coins - a.coins).map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2"
            >
              <span>
                {i === 0 ? "👑" : ""} {p.avatar} {p.name}
              </span>
              <span className="font-mono font-bold text-primary">{p.coins} 💰</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNextRound}
        className="bg-gold-gradient rounded-xl px-10 py-4 font-display text-xl font-black text-primary-foreground shadow-gold"
      >
        {isLastRound ? "SEE FINAL RESULTS" : "NEXT ROUND →"}
      </motion.button>
    </div>
  );
}
