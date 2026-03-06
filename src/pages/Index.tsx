import { useState } from "react";
import OnlineLobby from "@/components/game/OnlineLobby";
import OnlineGame from "@/components/game/OnlineGame";

export default function Index() {
  const [session, setSession] = useState<{
    roomId: string;
    playerId: string;
    roomCode: string;
    isHost: boolean;
    isSpectator: boolean;
  } | null>(null);

  if (!session) {
    return (
      <OnlineLobby
        onJoined={(roomId, playerId, roomCode, isHost, isSpectator) =>
          setSession({ roomId, playerId, roomCode, isHost, isSpectator })
        }
      />
    );
  }

  return (
    <OnlineGame
      roomId={session.roomId}
      playerId={session.playerId}
      roomCode={session.roomCode}
      isHost={session.isHost}
      isSpectator={session.isSpectator}
      onLeave={() => setSession(null)}
    />
  );
}
