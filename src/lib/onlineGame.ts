import { supabase } from "@/integrations/supabase/client";
import { STARTING_COINS, TOTAL_ROUNDS, challenges, getRandomChallenge } from "./gameData";

type OnlinePlayer = {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  avatar: string;
  coins: number;
  current_bid: number;
  has_bid: boolean;
  is_saboteur: boolean;
  is_spectator: boolean;
  is_eliminated: boolean;
};

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function isActivePlayer(player: Partial<OnlinePlayer>): boolean {
  return !player.is_spectator && !player.is_eliminated;
}

function getActivePlayers(players: OnlinePlayer[]): OnlinePlayer[] {
  return players.filter(isActivePlayer);
}

export async function createRoom(hostName: string, avatar: string): Promise<{ roomId: string; roomCode: string; playerId: string } | null> {
  const roomCode = generateRoomCode();
  const playerId = crypto.randomUUID();

  const { data: room, error } = await supabase
    .from("game_rooms")
    .insert({ room_code: roomCode, host_player_id: playerId, phase: "lobby", game_state: {} })
    .select()
    .single();

  if (error || !room) return null;

  const { error: playerError } = await supabase.from("game_players").insert({
    room_id: room.id,
    player_id: playerId,
    player_name: hostName,
    avatar,
    coins: STARTING_COINS,
    is_spectator: false,
    is_eliminated: false,
    eliminated_round: null,
  });

  if (playerError) return null;

  return { roomId: room.id, roomCode, playerId };
}

export async function joinRoom(
  roomCode: string,
  name: string,
  avatar: string,
): Promise<{ roomId: string; playerId: string; isSpectator: boolean } | null> {
  const { data: room, error } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("room_code", roomCode.toUpperCase())
    .single();

  if (error || !room) return null;

  const playerId = crypto.randomUUID();
  const isSpectator = room.phase !== "lobby";

  const { error: playerError } = await supabase.from("game_players").insert({
    room_id: room.id,
    player_id: playerId,
    player_name: name,
    avatar,
    coins: isSpectator ? 0 : STARTING_COINS,
    is_spectator: isSpectator,
    is_eliminated: false,
    eliminated_round: null,
  });

  if (playerError) return null;

  return { roomId: room.id, playerId, isSpectator };
}

export async function startNewRound(roomId: string, previousSaboteurId: string | null) {
  const { data: room } = await supabase.from("game_rooms").select("*").eq("id", roomId).single();
  const { data: players } = await supabase.from("game_players").select("*").eq("room_id", roomId);
  if (!room || !players) return;

  const activePlayers = getActivePlayers(players as OnlinePlayer[]);
  if (activePlayers.length < 2) {
    await supabase.from("game_rooms").update({ phase: "game-over" }).eq("id", roomId);
    return;
  }

  const currentRound = room.current_round + 1;
  const usedIds = ((room.game_state as any)?.usedChallengeIds as number[]) || [];
  const challenge = getRandomChallenge(usedIds);

  const playerIds = activePlayers.map((p) => p.player_id);
  const eligible = playerIds.filter((id) => id !== previousSaboteurId);
  const pool = eligible.length > 0 ? eligible : playerIds;
  const saboteurId = pool[Math.floor(Math.random() * pool.length)];

  await supabase
    .from("game_players")
    .update({ current_bid: 0, has_bid: false, is_saboteur: false })
    .eq("room_id", roomId);

  await supabase
    .from("game_players")
    .update({ is_saboteur: true })
    .eq("room_id", roomId)
    .eq("player_id", saboteurId);

  await supabase
    .from("game_rooms")
    .update({
      current_round: currentRound,
      phase: "role-reveal",
      game_state: {
        ...((room.game_state as any) || {}),
        usedChallengeIds: [...usedIds, challenge.id],
        currentChallengeId: challenge.id,
        saboteurId,
        resolvingRound: null,
        roundResults: ((room.game_state as any)?.roundResults as any[]) || [],
        readyPlayers: [],
      },
    })
    .eq("id", roomId);
}

export async function setRoomPhase(roomId: string, phase: string) {
  await supabase.from("game_rooms").update({ phase }).eq("id", roomId);
}

export async function markPlayerReady(roomId: string, playerId: string) {
  const { data: room } = await supabase.from("game_rooms").select("game_state").eq("id", roomId).single();
  if (!room) return;

  const gameState = (room.game_state as any) || {};
  const readyPlayers = gameState.readyPlayers || [];

  if (!readyPlayers.includes(playerId)) {
    await supabase.from("game_rooms").update({
      game_state: {
        ...gameState,
        readyPlayers: [...readyPlayers, playerId]
      }
    }).eq("id", roomId);
  }
}

export async function placeBid(roomId: string, playerId: string, bid: number) {
  const { data: player } = await supabase
    .from("game_players")
    .select("coins, is_spectator, is_eliminated")
    .eq("room_id", roomId)
    .eq("player_id", playerId)
    .single();

  if (!player || player.is_spectator || player.is_eliminated) return;

  const safeBid = Number.isFinite(bid) ? Math.floor(bid) : 0;
  const clampedBid = Math.max(0, Math.min(player.coins, safeBid));

  await supabase
    .from("game_players")
    .update({ current_bid: clampedBid, has_bid: true })
    .eq("room_id", roomId)
    .eq("player_id", playerId);
}

export async function resolveRound(roomId: string) {
  const { data: room } = await supabase.from("game_rooms").select("*").eq("id", roomId).single();
  if (!room || room.phase !== "bidding") return;

  const gameState = (room.game_state as any) || {};
  const currentRound = room.current_round;

  const { data: lockedRoom } = await supabase
    .from("game_rooms")
    .update({
      phase: "resolving",
      game_state: {
        ...gameState,
        resolvingRound: currentRound,
      },
    })
    .eq("id", roomId)
    .eq("phase", "bidding")
    .select("*")
    .maybeSingle();

  if (!lockedRoom) return;

  const { data: players } = await supabase.from("game_players").select("*").eq("room_id", roomId);
  if (!players || players.length === 0) return;

  const activePlayers = getActivePlayers(players as OnlinePlayer[]);
  const lockedGameState = (lockedRoom.game_state as any) || {};
  const prevResults = (lockedGameState.roundResults as any[]) || [];

  if (prevResults.some((r) => r.round === currentRound)) {
    await supabase
      .from("game_rooms")
      .update({
        phase: "round-result",
        game_state: {
          ...lockedGameState,
          resolvingRound: null,
        },
      })
      .eq("id", roomId);
    return;
  }

  if (activePlayers.length < 2) {
    await supabase
      .from("game_rooms")
      .update({
        phase: "game-over",
        game_state: {
          ...lockedGameState,
          resolvingRound: null,
        },
      })
      .eq("id", roomId);
    return;
  }

  const allBidded = activePlayers.every((p) => p.has_bid);
  if (!allBidded) {
    await supabase
      .from("game_rooms")
      .update({
        phase: "bidding",
        game_state: {
          ...lockedGameState,
          resolvingRound: null,
        },
      })
      .eq("id", roomId);
    return;
  }

  const challenge = challenges.find((c) => c.id === lockedGameState.currentChallengeId);
  const saboteurId = lockedGameState.saboteurId as string;
  if (!challenge || !saboteurId) {
    await supabase
      .from("game_rooms")
      .update({
        phase: "bidding",
        game_state: {
          ...lockedGameState,
          resolvingRound: null,
        },
      })
      .eq("id", roomId);
    return;
  }

  const bids = activePlayers.map((p) => ({ playerId: p.player_id, playerName: p.player_name, bid: p.current_bid }));
  const highestBid = Math.max(...bids.map((b) => b.bid));
  const highestBidder = bids.find((b) => b.bid === highestBid)!.playerId;
  const saboteurCaught = highestBid <= challenge.baseValue;

  for (const p of activePlayers) {
    let coins = p.coins;

    if (p.player_id === highestBidder) {
      coins -= p.current_bid;
      if (saboteurCaught) {
        coins += challenge.baseValue;
      }
    }

    if (p.player_id === saboteurId) {
      if (saboteurCaught) {
        coins -= 100;
      } else if (highestBidder !== saboteurId) {
        coins += highestBid;
      }
    }
    await supabase.from("game_players").update({ coins: Math.max(0, coins) }).eq("id", p.id);
  }

  const { data: updatedPlayers } = await supabase.from("game_players").select("*").eq("room_id", roomId);
  const updatedActivePlayers = getActivePlayers((updatedPlayers || []) as OnlinePlayer[]);

  let eliminatedPlayers: OnlinePlayer[] = [];
  if (updatedActivePlayers.length > 1) {
    eliminatedPlayers = updatedActivePlayers.filter((p) => p.coins <= 0);

    for (const eliminatedPlayer of eliminatedPlayers) {
      await supabase
        .from("game_players")
        .update({
          is_eliminated: true,
          is_spectator: true,
          is_saboteur: false,
          has_bid: false,
          current_bid: 0,
          eliminated_round: currentRound,
        })
        .eq("id", eliminatedPlayer.id);
    }
  }

  const eliminatedIds = eliminatedPlayers.map((p) => p.id);
  const remainingActivePlayers = updatedActivePlayers.filter((p) => !eliminatedIds.includes(p.id));

  const roundResult = {
    round: currentRound,
    challenge: { title: challenge.title, baseValue: challenge.baseValue, difficulty: challenge.difficulty },
    bids,
    highestBidder,
    saboteurId,
    saboteurCaught,
    eliminatedPlayerIds: eliminatedPlayers.map((p) => p.player_id),
    eliminatedPlayerNames: eliminatedPlayers.map((p) => p.player_name),
  };

  const reachedRoundLimit = currentRound >= TOTAL_ROUNDS;
  const shouldEndGame = reachedRoundLimit || remainingActivePlayers.length <= 1;

  await supabase
    .from("game_rooms")
    .update({
      phase: shouldEndGame ? "game-over" : "round-result",
      game_state: {
        ...lockedGameState,
        resolvingRound: null,
        roundResults: [...prevResults, roundResult],
      },
    })
    .eq("id", roomId);
}

export function subscribeToRoom(roomId: string, onUpdate: (room: any) => void) {
  return supabase
    .channel(`room-${roomId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` }, (payload) => {
      if (payload.eventType === 'DELETE') {
        onUpdate({ phase: 'deleted' });
      } else {
        onUpdate(payload.new);
      }
    })
    .subscribe();
}

export function subscribeToPlayers(roomId: string, onUpdate: (players: any[]) => void) {
  const fetchPlayers = async () => {
    const { data } = await supabase.from("game_players").select("*").eq("room_id", roomId);
    if (data) onUpdate(data);
  };

  fetchPlayers();

  const channel = supabase
    .channel(`players-${roomId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "game_players", filter: `room_id=eq.${roomId}` }, () => {
      fetchPlayers();
    })
    .subscribe();

  return channel;
}

export async function leaveRoom(roomId: string, playerId: string) {
  await supabase.from("game_players").delete().eq("room_id", roomId).eq("player_id", playerId);
}

export async function deleteRoom(roomId: string) {
  await supabase.from("game_rooms").delete().eq("id", roomId);
}
