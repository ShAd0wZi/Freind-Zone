import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function HowToPlay() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="rounded-xl border-2 border-primary/40 px-6 py-3 font-display text-lg font-black text-primary transition-colors hover:bg-primary/10">
                    HOW TO PLAY 📖
                </button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="font-display text-2xl font-black text-gold-glow">
                        👶 The Super Simple Rules!
                    </DialogTitle>
                    <DialogDescription className="text-foreground/80">
                        A quick guide for a fun time!
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-6">
                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-display text-lg font-bold">
                            <span>💰</span> Step 1: You get Coins!
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Everyone starts with 1000 shiny coins. The goal is to be the richest player at the end!
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-display text-lg font-bold">
                            <span>🦹</span> Step 2: The Secret Bad Guy
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Every round, one player is secretly chosen as the "Saboteur" (the sneaky trickster).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-display text-lg font-bold">
                            <span>🎯</span> Step 3: The Challenge
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            A fun challenge appears with a "Value" (like 300 coins). Everyone secretly guesses (bids) how many coins they want to pay to do it!
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-display text-lg font-bold">
                            <span>🏆</span> Step 4: Who Wins?
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            The person who bids the most coins pays up and gets to do the challenge!
                        </p>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/50 p-4">
                        <h4 className="flex items-center gap-2 font-display text-lg font-bold text-accent">
                            <span>🪤</span> Step 5: The Trap!
                        </h4>
                        <ul className="mt-2 space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="shrink-0">🛡️</span>
                                <span>
                                    <strong className="text-foreground">Safe:</strong> If the winner bids <em>less</em> than or <em>equal</em> to the Value, they win those coins! The sneaky Saboteur is caught and loses 100 coins.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="shrink-0">💥</span>
                                <span>
                                    <strong className="text-accent">Trap:</strong> If the winner bids <em>more</em> than the Value... Oh no! The Saboteur wins and steals all the coins the winner paid!
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div className="text-center font-display font-medium italic text-primary">
                        Survive 5 rounds and be the richest player to win! 🎉
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
