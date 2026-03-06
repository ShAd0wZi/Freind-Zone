
-- Game rooms table
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  game_state JSONB NOT NULL DEFAULT '{}',
  phase TEXT NOT NULL DEFAULT 'lobby',
  current_round INTEGER NOT NULL DEFAULT 0,
  host_player_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Players in rooms
CREATE TABLE public.game_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🎭',
  coins INTEGER NOT NULL DEFAULT 1000,
  is_saboteur BOOLEAN NOT NULL DEFAULT false,
  current_bid INTEGER NOT NULL DEFAULT 0,
  has_bid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/write rooms (no auth needed for party game)
CREATE POLICY "Anyone can view rooms" ON public.game_rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rooms" ON public.game_rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete rooms" ON public.game_rooms FOR DELETE USING (true);

CREATE POLICY "Anyone can view players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Anyone can join rooms" ON public.game_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update players" ON public.game_players FOR UPDATE USING (true);
CREATE POLICY "Anyone can leave rooms" ON public.game_players FOR DELETE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;

-- Index for room codes
CREATE INDEX idx_room_code ON public.game_rooms(room_code);
CREATE INDEX idx_players_room ON public.game_players(room_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
