import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Challenge } from "@/lib/gameData";
import { playBidLockInSound, playTimerTickSound } from "@/lib/soundEffects";
import AvatarDisplay from "@/components/AvatarDisplay";

interface BiddingOnlineProps {
  player: any;
  challenge: Challenge;
  allPlayers: any[];
  onBid: (bid: number) => void;
  onAllBidsIn: () => void;
  shouldResolve?: boolean;
}

const BIDDING_TIME = 45;

export default function BiddingOnline({ player, challenge, allPlayers, onBid, onAllBidsIn, shouldResolve = false }: BiddingOnlineProps) {
  const [bid, setBid] = useState(50);
  const [timeLeft, setTimeLeft] = useState(BIDDING_TIME);
  const autoSubmittedRef = useRef(false);
  const previousTimeRef = useRef(BIDDING_TIME);
  const hasBid = player.has_bid;
  const maxBid = player.coins;

  const biddedCount = allPlayers.filter((p) => p.has_bid).length;
  const allBidsIn = biddedCount === allPlayers.length;

  useEffect(() => {
    setBid((prev) => Math.max(0, Math.min(maxBid, prev)));
  }, [maxBid]);

  useEffect(() => {
    if (hasBid) autoSubmittedRef.current = true;
  }, [hasBid]);

  useEffect(() => {
    if (!hasBid && timeLeft > 0 && timeLeft <= 10 && timeLeft < previousTimeRef.current) {
      playTimerTickSound();
    }
    previousTimeRef.current = timeLeft;
  }, [hasBid, timeLeft]);

  useEffect(() => {
    if (hasBid || allBidsIn) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
            playBidLockInSound();
            onBid(Math.max(0, Math.min(maxBid, bid)));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasBid, allBidsIn, bid, maxBid, onBid]);

  useEffect(() => {
    if (allBidsIn && shouldResolve) {
      const timer = setTimeout(onAllBidsIn, 1000);
      return () => clearTimeout(timer);
    }
  }, [allBidsIn, onAllBidsIn, shouldResolve]);

  const handleSubmit = () => {
    if (hasBid) return;
    autoSubmittedRef.current = true;
    playBidLockInSound();
    onBid(Math.max(0, Math.min(maxBid, bid)));
  };

  const presets = [50, 100, 200, Math.round(challenge.baseValue * 0.5), challenge.baseValue].filter((p) => p <= maxBid && p > 0);
  const timerColor = timeLeft <= 10 ? "text-accent" : timeLeft <= 20 ? "text-gold-glow" : "text-primary";
  const timerPercent = (timeLeft / BIDDING_TIME) * 100;

  if (hasBid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
          <p className="text-5xl">LOCKED</p>
          <h3 className="mt-3 font-display text-2xl font-black text-gold-glow">BID LOCKED IN</h3>
          <p className="mt-2 font-mono text-3xl font-bold text-primary">{player.current_bid}</p>
        </motion.div>

        <div className="card-heist rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {biddedCount}/{allPlayers.length} players have bid
          </p>
          <div className="mt-3 flex justify-center gap-2">
            {allPlayers.map((p) => (
              <div
                key={p.id}
                className={`h-3 w-3 rounded-full transition-colors ${p.has_bid ? "bg-primary" : "bg-secondary"}`}
                title={p.player_name}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center justify-between">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            "{challenge.title}" - Base: {challenge.baseValue}
          </p>
          <motion.span
            key={timeLeft}
            initial={timeLeft <= 10 ? { scale: 1.3 } : {}}
            animate={{ scale: 1 }}
            className={`font-mono text-2xl font-black ${timerColor}`}
          >
            {timeLeft}s
          </motion.span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className={`h-full rounded-full ${timeLeft <= 10 ? "bg-accent" : "bg-primary"}`}
            initial={{ width: "100%" }}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-heist w-full max-w-md rounded-2xl p-6 text-center">
        <AvatarDisplay avatar={player.avatar} size="2xl" name={player.player_name} className="mx-auto" />
        <h3 className="mt-2 font-display text-2xl font-black text-gold-glow">{player.player_name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Coins: {player.coins}</p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={() => setBid(Math.max(0, bid - 50))} className="rounded-lg bg-secondary px-4 py-2 text-xl font-bold text-foreground">
            -
          </button>
          <motion.span key={bid} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="w-24 text-center font-display text-4xl font-black text-primary">
            {bid}
          </motion.span>
          <button onClick={() => setBid(Math.min(maxBid, bid + 50))} className="rounded-lg bg-secondary px-4 py-2 text-xl font-bold text-foreground">
            +
          </button>
        </div>

        <input type="range" min={0} max={maxBid} step={10} value={bid} onChange={(e) => setBid(Number(e.target.value))} className="mt-4 w-full accent-primary" />

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setBid(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
                bid === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="bg-gold-gradient mt-6 w-full rounded-xl py-4 font-display text-lg font-black text-primary-foreground shadow-gold"
        >
          LOCK IN BID
        </motion.button>
      </motion.div>
    </div>
  );
}
