
CREATE TABLE public.game_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_name text NOT NULL,
  avatar text NOT NULL DEFAULT '🎭',
  message text NOT NULL,
  is_reaction boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.game_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view messages" ON public.game_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can send messages" ON public.game_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete messages" ON public.game_messages FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_messages;
