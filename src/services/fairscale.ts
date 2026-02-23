export interface FairScoreResponse {
    wallet: string;
    fairscore_base: number;
    social_score: number;
    fairscore: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    badges: Array<{
        id: string;
        label: string;
        description: string;
        tier: string;
    }>;
    features: {
        tx_count: number;
        active_days: number;
        wallet_age_days: number;
        lst_percentile_score?: number;
        major_percentile_score?: number;
    };
}

export interface LeaderboardEntry {
    rank: number;
    wallet: string;
    score: number;
    tier: string;
}

export interface TierEntry {
    tier: string;
    count: number;
    color: string;
}

export class FairScaleService {
    private static API_KEY = import.meta.env.VITE_FAIRSCALE_API_KEY || '';
    private static STORAGE_KEY = 'reputagate_leaderboard';

    static async getScore(wallet: string): Promise<FairScoreResponse> {
        // If we have an API key, use the real endpoint
        if (this.API_KEY) {
            try {
                const response = await fetch(`https://api.fairscale.xyz/score?wallet=${wallet}`, {
                    headers: { 'fairkey': this.API_KEY }
                });
                if (!response.ok) throw new Error('FairScale API Error');
                const data = await response.json();

                // Persistence: Save this real score to the local index
                this.persistEntry(data);

                return data;
            } catch (error) {
                console.error('FairScale API failed:', error);
            }
        }

        // Return pure zeroed state (No Mock Fallbacks)
        return {
            wallet,
            fairscore_base: 0,
            social_score: 0,
            fairscore: 0,
            tier: 'bronze',
            badges: [],
            features: { tx_count: 0, active_days: 0, wallet_age_days: 0 }
        };
    }

    private static persistEntry(data: FairScoreResponse) {
        try {
            const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            saved[data.wallet] = {
                rank: 0, // Rank will be calculated on fetch
                wallet: data.wallet.slice(0, 4) + '...' + data.wallet.slice(-4),
                score: data.fairscore,
                tier: data.tier,
                fullWallet: data.wallet
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {
            console.error('Failed to persist score:', e);
        }
    }

    static getAPRBonus(tier: string): number {
        switch (tier.toLowerCase()) {
            case 'platinum': return 10;
            case 'gold': return 5;
            case 'silver': return 2;
            default: return 0;
        }
    }

    static getLeaderboard(): LeaderboardEntry[] {
        try {
            const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            const entries: LeaderboardEntry[] = Object.values(saved);

            // Sort by score descending and take top 10
            return entries
                .sort((a, b) => b.score - a.score)
                .map((item, index) => ({
                    ...item,
                    rank: index + 1
                }))
                .slice(0, 10);
        } catch (e) {
            return [];
        }
    }

    static getTierDistribution(): TierEntry[] {
        try {
            const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
            const entries = Object.values(saved) as any[];

            const counts = {
                platinum: entries.filter(e => e.tier === 'platinum').length,
                gold: entries.filter(e => e.tier === 'gold').length,
                silver: entries.filter(e => e.tier === 'silver').length,
                bronze: entries.filter(e => e.tier === 'bronze').length
            };

            return [
                { tier: 'Platinum', count: counts.platinum, color: '#fbbf24' },
                { tier: 'Gold', count: counts.gold, color: '#f59e0b' },
                { tier: 'Silver', count: counts.silver, color: '#d1d5db' },
                { tier: 'Bronze', count: counts.bronze, color: '#9ca3af' },
            ];
        } catch (e) {
            return [
                { tier: 'Platinum', count: 0, color: '#fbbf24' },
                { tier: 'Gold', count: 0, color: '#f59e0b' },
                { tier: 'Silver', count: 0, color: '#d1d5db' },
                { tier: 'Bronze', count: 0, color: '#9ca3af' },
            ];
        }
    }

    static getActivityFeed() {
        return [
            "Network Status: Monitoring Solana Neural Index",
            "Privacy Mode: Active",
            "Waiting for on-chain identity events..."
        ];
    }
}
