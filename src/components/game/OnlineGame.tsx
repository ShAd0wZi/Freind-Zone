import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  subscribeToPlayers,
  subscribeToRoom,
  startNewRound,
  setRoomPhase,
  placeBid,
  resolveRound,
  leaveRoom,
  deleteRoom,
  markPlayerReady,
} from "@/lib/onlineGame";
import { challenges, STARTING_COINS, TOTAL_ROUNDS } from "@/lib/gameData";
import { supabase } from "@/integrations/supabase/client";
import AvatarDisplay from "@/components/AvatarDisplay";
import RoleRevealOnline from "./RoleRevealOnline";
import ChallengeReveal from "./ChallengeReveal";
import BiddingOnline from "./BiddingOnline";
import RoundResultOnline from "./RoundResultOnline";
import GameOver from "./GameOver";
import GameChat from "./GameChat";

interface OnlineGameProps {
  roomId: string;
  playerId: string;
  roomCode: string;
  isHost: boolean;
  isSpectator: boolean;
  onLeave: () => void;
}

function isActivePlayer(player: any): boolean {
  return !player.is_spectator && !player.is_eliminated;
}

export default function OnlineGame({ roomId, playerId, roomCode, isHost, isSpectator, onLeave }: OnlineGameProps) {
  const [room, setRoom] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoom = async () => {
      const { data } = await supabase.from("game_rooms").select("*").eq("id", roomId).single();
      if (data) setRoom(data);
    };
    fetchRoom();

    const roomChannel = subscribeToRoom(roomId, setRoom);
    const playerChannel = subscribeToPlayers(roomId, setPlayers);

    return () => {
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(playerChannel);
    };
  }, [roomId]);

  const handleStartGame = async () => {
    await startNewRound(roomId, null);
  };

  const handleRoleRevealDone = async () => {
    if (isHost) await setRoomPhase(roomId, "challenge-reveal");
  };

  const handleStartBidding = async () => {
    if (isHost) await setRoomPhase(roomId, "bidding");
  };

  const handleBid = async (bid: number) => {
    await placeBid(roomId, playerId, bid);
  };

  const handleResolve = async () => {
    if (!isHost || room?.phase !== "bidding") return;
    const { data: currentPlayers } = await supabase.from("game_players").select("*").eq("room_id", roomId);
    const activePlayers = (currentPlayers || []).filter(isActivePlayer);
    if (activePlayers.length > 0 && activePlayers.every((p) => p.has_bid)) {
      await resolveRound(roomId);
    }
  };

  const handleNextRound = async () => {
    if (!isHost) return;
    const activePlayers = players.filter(isActivePlayer);
    if (room.current_round >= TOTAL_ROUNDS || activePlayers.length <= 1) {
      await setRoomPhase(roomId, "game-over");
      return;
    }

    const gameState = room.game_state as any;
    await startNewRound(roomId, gameState?.saboteurId || null);
  };

  const handlePlayAgain = async () => {
    if (!isHost) return;
    for (const p of players) {
      await supabase
        .from("game_players")
        .update({
          coins: STARTING_COINS,
          current_bid: 0,
          has_bid: false,
          is_saboteur: false,
          is_spectator: false,
          is_eliminated: false,
          eliminated_round: null,
        })
        .eq("id", p.id);
    }
    await supabase.from("game_rooms").update({ phase: "lobby", current_round: 0, game_state: {} }).eq("id", roomId);
  };

  const handleLeave = async () => {
    await leaveRoom(roomId, playerId);
    if (isHost) await deleteRoom(roomId);
    onLeave();
  };

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Connecting...</p>
      </div>
    );
  }

  const phase = room.phase;
  const gameState = room.game_state as any;
  const currentChallenge = gameState?.currentChallengeId ? challenges.find((c) => c.id === gameState.currentChallengeId) : null;

  const myPlayer = players.find((p) => p.player_id === playerId);
  const amSpectator = isSpectator || !myPlayer || myPlayer.is_spectator || myPlayer.is_eliminated;
  const isSaboteur = Boolean(myPlayer?.is_saboteur);

  const activePlayers = players.filter(isActivePlayer);
  const spectatorPlayers = players.filter((p) => p.is_spectator || p.is_eliminated);

  const chatOverlay = myPlayer ? (
    <GameChat roomId={roomId} playerId={playerId} playerName={myPlayer.player_name} avatar={myPlayer.avatar} />
  ) : null;

  if (phase === "lobby") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <h2 className="font-display text-3xl font-black text-gold-glow">WAITING ROOM</h2>
        <div className="card-heist rounded-xl p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Share this code</p>
          <p className="mt-2 font-mono text-5xl font-black tracking-[0.3em] text-primary">{roomCode}</p>
        </div>
        <div className="w-full max-w-md space-y-2">
          {players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <AvatarDisplay avatar={p.avatar} size="md" name={p.player_name} />
                <span className="font-bold">{p.player_name}</span>
                {p.player_id === room.host_player_id && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs text-primary">HOST</span>
                )}
                {p.is_eliminated && (
                  <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">ELIMINATED</span>
                )}
                {p.is_spectator && !p.is_eliminated && (
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">SPECTATOR</span>
                )}
              </span>
              {p.player_id === playerId && <span className="text-xs text-muted-foreground">YOU</span>}
            </motion.div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {activePlayers.length} active player{activePlayers.length !== 1 ? "s" : ""}
          {spectatorPlayers.length > 0
            ? ` and ${spectatorPlayers.length} spectator${spectatorPlayers.length !== 1 ? "s" : ""}`
            : ""}
        </p>
        {isHost && activePlayers.length >= 3 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartGame}
            className="bg-gold-gradient rounded-xl px-12 py-4 font-display text-2xl font-black text-primary-foreground shadow-gold"
          >
            START GAME
          </motion.button>
        )}
        {isHost && activePlayers.length < 3 && <p className="text-sm text-muted-foreground">Need at least 3 active players</p>}
        {!isHost && <p className="text-sm text-muted-foreground">Waiting for host to start...</p>}
        <button onClick={handleLeave} className="text-sm text-muted-foreground hover:text-accent">
          Leave Room
        </button>
        {chatOverlay}
      </motion.div>
    );
  }

  if (phase === "deleted") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
        <h2 className="font-display text-3xl font-black text-accent">ROOM CLOSED</h2>
        <p className="text-muted-foreground">The Host has ended the game.</p>
        <button onClick={onLeave} className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground">
          RETURN TO MENU
        </button>
      </div>
    );
  }

  if (phase === "role-reveal") {
    const readyPlayers = gameState?.readyPlayers || [];
    const isAllReady = activePlayers.every((p) => readyPlayers.includes(p.player_id));

    const handleReady = async () => {
      await markPlayerReady(roomId, playerId);
    };

    if (amSpectator) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h3 className="font-display text-3xl font-black text-gold-glow">SPECTATOR MODE</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            Active players are revealing roles. You can watch this round and chat while waiting for the next phase.
          </p>
          {chatOverlay}
        </div>
      );
    }

    return (
      <>
        {chatOverlay}
        <RoleRevealOnline
          isSaboteur={isSaboteur}
          playerName={myPlayer?.player_name || ""}
          isHost={isHost}
          onDone={handleRoleRevealDone}
          onReady={handleReady}
          isAllReady={isAllReady}
        />
      </>
    );
  }

  if (phase === "challenge-reveal" && currentChallenge) {
    return (
      <>
        {chatOverlay}
        <ChallengeReveal challenge={currentChallenge} round={room.current_round} totalRounds={TOTAL_ROUNDS} onStartBidding={handleStartBidding} />
      </>
    );
  }

  if (phase === "bidding" && currentChallenge) {
    if (amSpectator || !myPlayer) {
      const biddedCount = activePlayers.filter((p) => p.has_bid).length;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
          <h3 className="font-display text-3xl font-black text-gold-glow">WATCHING BIDDING</h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {biddedCount}/{activePlayers.length} active players have locked bids.
          </p>
          <div className="w-full max-w-md space-y-2">
            {activePlayers.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-secondary/30 px-4 py-3">
                <span className="flex items-center gap-2">
                  <AvatarDisplay avatar={p.avatar} size="sm" name={p.player_name} />
                  {p.player_name}
                </span>
                <span className={`text-xs ${p.has_bid ? "text-primary" : "text-muted-foreground"}`}>
                  {p.has_bid ? "BID LOCKED" : "THINKING"}
                </span>
              </div>
            ))}
          </div>
          {chatOverlay}
        </div>
      );
    }

    return (
      <>
        {chatOverlay}
        <BiddingOnline
          player={myPlayer}
          challenge={currentChallenge}
          allPlayers={activePlayers}
          onBid={handleBid}
          onAllBidsIn={handleResolve}
          shouldResolve={isHost}
        />
      </>
    );
  }

  if (phase === "round-result" && gameState?.roundResults?.length > 0) {
    const lastResult = gameState.roundResults[gameState.roundResults.length - 1];
    return (
      <>
        {chatOverlay}
        <RoundResultOnline
          result={lastResult}
          players={players}
          isHost={isHost}
          onNextRound={handleNextRound}
          isLastRound={room.current_round >= TOTAL_ROUNDS || activePlayers.length <= 1}
        />
      </>
    );
  }

  if (phase === "game-over") {
    const mappedPlayers = players.map((p) => ({
      id: p.player_id,
      name: p.player_name,
      coins: p.coins,
      avatar: p.avatar,
      isSaboteur: false,
      currentBid: 0,
      isReady: false,
    }));
    return (
      <>
        {chatOverlay}
        <GameOver players={mappedPlayers} onPlayAgain={isHost ? handlePlayAgain : onLeave} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Syncing...</p>
      {chatOverlay}
    </div>
  );
}
