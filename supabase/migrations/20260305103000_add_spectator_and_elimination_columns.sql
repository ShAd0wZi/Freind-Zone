ALTER TABLE public.game_players
ADD COLUMN is_spectator BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_eliminated BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN eliminated_round INTEGER;

CREATE INDEX idx_game_players_active
ON public.game_players (room_id, is_spectator, is_eliminated);
