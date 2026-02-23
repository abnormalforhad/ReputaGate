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

const MOCK_DATA: Record<string, FairScoreResponse> = {
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': {
        wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        fairscore_base: 58.1,
        social_score: 36.0,
        fairscore: 84.5,
        tier: 'platinum',
        badges: [
            { id: 'diamond_hands', label: 'Diamond Hands', description: 'Long-term holder with conviction', tier: 'platinum' },
            { id: 'lst_maxi', label: 'LST Maxi', description: 'Heavy user of liquid staking tokens', tier: 'gold' }
        ],
        features: {
            tx_count: 1250,
            active_days: 180,
            wallet_age_days: 365,
            lst_percentile_score: 0.75,
            major_percentile_score: 0.82
        }
    }
};

export class FairScaleService {
    private static API_KEY = import.meta.env.VITE_FAIRSCALE_API_KEY || '';

    static async getScore(wallet: string): Promise<FairScoreResponse> {
        // If we have an API key, use the real endpoint
        if (this.API_KEY) {
            try {
                const response = await fetch(`https://api.fairscale.xyz/score?wallet=${wallet}`, {
                    headers: { 'fairkey': this.API_KEY }
                });
                if (!response.ok) throw new Error('FairScale API Error');
                return await response.json();
            } catch (error) {
                console.error('FairScale API failed, falling back to mock:', error);
            }
        }

        // Default mock behavior
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_DATA[wallet] || {
                    wallet,
                    fairscore_base: 20,
                    social_score: 10,
                    fairscore: 30,
                    tier: 'bronze',
                    badges: [],
                    features: { tx_count: 10, active_days: 5, wallet_age_days: 10 }
                });
            }, 800);
        });
    }

    static getAPRBonus(tier: string): number {
        switch (tier.toLowerCase()) {
            case 'platinum': return 10;
            case 'gold': return 5;
            case 'silver': return 2;
            default: return 0;
        }
    }
}
