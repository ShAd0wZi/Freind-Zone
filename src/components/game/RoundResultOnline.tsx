import { useEffect } from "react";
import { motion } from "framer-motion";
import { playSaboteurRevealSound } from "@/lib/soundEffects";
import AvatarDisplay from "@/components/AvatarDisplay";

interface RoundResultOnlineProps {
  result: any;
  players: any[];
  isHost: boolean;
  onNextRound: () => void;
  isLastRound: boolean;
}

export default function RoundResultOnline({ result, players, isHost, onNextRound, isLastRound }: RoundResultOnlineProps) {
  const saboteur = players.find((p) => p.player_id === result.saboteurId);
  const highBidder = players.find((p) => p.player_id === result.highestBidder);
  const sortedBids = [...result.bids].sort((a: any, b: any) => b.bid - a.bid);

  useEffect(() => {
    playSaboteurRevealSound(Boolean(saboteur));
  }, [result.round, saboteur]);

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

      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card-heist w-full max-w-md rounded-2xl p-6">
        <p className="text-center text-sm text-muted-foreground">
          Challenge: <span className="font-bold text-foreground">{result.challenge.title}</span> (Base: {result.challenge.baseValue})
        </p>
        <div className="mt-4 space-y-2">
          {sortedBids.map((b: any, i: number) => (
            <motion.div
              key={b.playerId}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${b.playerId === result.highestBidder ? "bg-primary/20 ring-1 ring-primary/40" : "bg-secondary/30"
                }`}
            >
              <span className="font-bold">{b.playerName}</span>
              <span className="font-mono font-bold text-primary">{b.bid}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="card-heist rounded-2xl p-6 text-center"
        style={{ borderColor: "hsl(var(--saboteur))" }}
      >
        <p className="text-5xl">SABOTEUR</p>
        <p className="mt-2 font-display text-2xl font-black text-saboteur">{saboteur?.player_name} was the SABOTEUR!</p>
        {highBidder && (
          <p className="mt-2 text-sm text-muted-foreground">
            {result.saboteurCaught ? (
              <span className="text-success">{highBidder.player_name} bid wisely. Saboteur loses coins.</span>
            ) : (
              <span className="text-saboteur">{highBidder.player_name} overbid. Saboteur steals their coins.</span>
            )}
          </p>
        )}
      </motion.div>

      {result.eliminatedPlayerNames && result.eliminatedPlayerNames.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }} className="rounded-xl border border-accent/40 bg-accent/10 px-5 py-3 text-center">
          <p className="text-sm text-accent">
            Eliminated this round: <span className="font-bold">{result.eliminatedPlayerNames.join(", ")}</span>
          </p>
        </motion.div>
      )}

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="w-full max-w-md">
        <h3 className="mb-3 text-center font-display text-lg font-bold text-muted-foreground">STANDINGS</h3>
        <div className="space-y-1">
          {[...players]
            .sort((a, b) => b.coins - a.coins)
            .map((p, i) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-2">
                <span className="flex items-center gap-2">
                  {i === 0 ? "LEAD " : ""}
                  <AvatarDisplay avatar={p.avatar} size="sm" name={p.player_name} />
                  {p.player_name}
                  {p.is_eliminated ? " (ELIMINATED)" : p.is_spectator ? " (SPECTATOR)" : ""}
                </span>
                <span className="font-mono font-bold text-primary">{p.coins} coins</span>
              </div>
            ))}
        </div>
      </motion.div>

      {isHost ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextRound}
          className="bg-gold-gradient rounded-xl px-10 py-4 font-display text-xl font-black text-primary-foreground shadow-gold"
        >
          {isLastRound ? "SEE FINAL RESULTS" : "NEXT ROUND"}
        </motion.button>
      ) : (
        <p className="text-sm text-muted-foreground">Waiting for host...</p>
      )}
    </div>
  );
}
