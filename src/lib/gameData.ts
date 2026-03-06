export interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  baseValue: number;
}

export const challenges: Challenge[] = [
  { id: 1, title: "The Vault Heist", description: "Crack a 4-digit code. First to solve it wins bonus coins. Wrong guesses lose coins!", difficulty: "hard", baseValue: 500 },
  { id: 2, title: "Bluff Master", description: "Tell a story — two truths, one lie. Others guess the lie. Fool everyone = big payout.", difficulty: "medium", baseValue: 300 },
  { id: 3, title: "Speed Sketch", description: "Draw a secret word in 30 seconds. Others guess. More guesses = more value.", difficulty: "easy", baseValue: 200 },
  { id: 4, title: "The Alibi", description: "Two players must separately describe their 'shared' fake alibi. Consistency = survival.", difficulty: "hard", baseValue: 450 },
  { id: 5, title: "Reverse Auction", description: "Name the LOWEST price you'd accept for an absurd dare. Lowest bidder must do it or lose double.", difficulty: "medium", baseValue: 350 },
  { id: 6, title: "Mind Reader", description: "Predict which option the group will vote for. Match the majority = jackpot.", difficulty: "easy", baseValue: 250 },
  { id: 7, title: "Double Agent", description: "Everyone votes on a statement. The Saboteur tries to be on the losing side without being caught.", difficulty: "hard", baseValue: 400 },
  { id: 8, title: "Rapid Fire", description: "Name items in a category. Last person to name one before time runs out loses their bid.", difficulty: "easy", baseValue: 200 },
  { id: 9, title: "The Gambit", description: "Rock-paper-scissors tournament bracket. Winner takes the pot, losers get nothing.", difficulty: "medium", baseValue: 300 },
  { id: 10, title: "Conspiracy Theory", description: "Invent the most convincing fake conspiracy. Group votes. Most votes = biggest payout.", difficulty: "medium", baseValue: 350 },
  { id: 11, title: "Price is Wrong", description: "Guess the real price of a bizarre item. Closest WITHOUT going over wins.", difficulty: "easy", baseValue: 250 },
  { id: 12, title: "Hostage Negotiator", description: "One player 'kidnaps' an item. Others bid to get it back. Highest bidder pays, lowest bidder loses too.", difficulty: "hard", baseValue: 500 },
  { id: 13, title: "Poker Face", description: "Each player picks a number 1-10. Closest to the secret number wins, but show NO reaction when it's revealed.", difficulty: "medium", baseValue: 300 },
  { id: 14, title: "The Heist Crew", description: "Assign roles for a fictional heist. Group votes on the best plan. Winning team splits the pot.", difficulty: "hard", baseValue: 450 },
  { id: 15, title: "Liar's Dice", description: "Secretly roll a number. Bluff about what you rolled. Get called out = lose everything.", difficulty: "hard", baseValue: 500 },
  { id: 16, title: "Word Smuggler", description: "Sneak a secret word into conversation without anyone noticing. If caught, you pay double.", difficulty: "medium", baseValue: 350 },
  { id: 17, title: "The Fence", description: "One player is the 'fence' selling stolen goods. Others bid on mystery items sight unseen.", difficulty: "easy", baseValue: 200 },
  { id: 18, title: "Interrogation", description: "One player is interrogated. Others ask questions. Catch the lie = bonus. Get fooled = lose coins.", difficulty: "hard", baseValue: 400 },
  { id: 19, title: "Shell Game", description: "Track the item through three shuffles. Bet on which shell it's under. Wrong = broke.", difficulty: "easy", baseValue: 250 },
  { id: 20, title: "The Mole", description: "Everyone writes a 'fact.' One is fake. Find the fake = payday. Write the fake = saboteur bonus.", difficulty: "medium", baseValue: 350 },
  { id: 21, title: "Auction Frenzy", description: "Three items up for bid simultaneously. Highest combined spender loses, but individual winners keep items.", difficulty: "hard", baseValue: 500 },
  { id: 22, title: "Trust Fall", description: "Split coins with a partner. Both must agree on the split or BOTH lose everything.", difficulty: "medium", baseValue: 300 },
  { id: 23, title: "Safecracker", description: "Guess the 3-number combo. Each wrong guess costs coins. First to crack it takes the vault.", difficulty: "hard", baseValue: 450 },
  { id: 24, title: "The Switcheroo", description: "Secretly swap your bid with another player. If they overbid, YOU profit from their loss.", difficulty: "hard", baseValue: 400 },
  { id: 25, title: "Last One Standing", description: "Players take turns raising the stakes. First to fold loses their ante. Last standing wins the pot.", difficulty: "medium", baseValue: 350 },
];

export interface Player {
  id: string;
  name: string;
  coins: number;
  isSaboteur: boolean;
  avatar: string;
  currentBid: number;
  isReady: boolean;
}

export const avatarEmojis = ["🎭", "🃏", "🎪", "🎩", "🗡️", "💎", "🔮", "🎲"];

export const STARTING_COINS = 1000;
export const TOTAL_ROUNDS = 5;

export type GamePhase = 'lobby' | 'role-reveal' | 'challenge-reveal' | 'bidding' | 'round-result' | 'game-over';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentRound: number;
  currentChallenge: Challenge | null;
  usedChallengeIds: number[];
  saboteurId: string | null;
  roundResults: RoundResult[];
  currentPlayerTurn: number; // for pass-the-phone bidding
}

export interface RoundResult {
  round: number;
  challenge: Challenge;
  bids: { playerId: string; playerName: string; bid: number }[];
  highestBidder: string;
  saboteurId: string;
  saboteurCaught: boolean;
  eliminatedPlayerIds?: string[];
  eliminatedPlayerNames?: string[];
}

export function createInitialState(): GameState {
  return {
    phase: 'lobby',
    players: [],
    currentRound: 0,
    currentChallenge: null,
    usedChallengeIds: [],
    saboteurId: null,
    roundResults: [],
    currentPlayerTurn: 0,
  };
}

export function getRandomChallenge(usedIds: number[]): Challenge {
  const available = challenges.filter(c => !usedIds.includes(c.id));
  if (available.length === 0) return challenges[Math.floor(Math.random() * challenges.length)];
  return available[Math.floor(Math.random() * available.length)];
}

export function selectSaboteur(players: Player[], previousSaboteurId: string | null): string {
  const eligible = players.filter(p => p.id !== previousSaboteurId);
  return eligible[Math.floor(Math.random() * eligible.length)].id;
}
