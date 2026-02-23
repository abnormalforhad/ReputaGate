import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FairScaleService } from './services/fairscale';
import type { FairScoreResponse } from './services/fairscale';
import './index.css';

function App() {
  const { publicKey, connected } = useWallet();
  const [scoreData, setScoreData] = useState<FairScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchReputation(publicKey.toString());
    } else {
      setScoreData(null);
    }
  }, [connected, publicKey]);

  const fetchReputation = async (walletAddress: string) => {
    setLoading(true);
    try {
      const data = await FairScaleService.getScore(walletAddress);
      setScoreData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aprBonus = scoreData ? FairScaleService.getAPRBonus(scoreData.tier) : 0;
  const leaderboard = FairScaleService.getLeaderboard();
  const distribution = FairScaleService.getTierDistribution();
  const tickerItems = FairScaleService.getActivityFeed();

  return (
    <div className="app-wrapper">
      <nav>
        <div className="logo">Reputa<span className="amber-text">Gate</span></div>
        <WalletMultiButton />
      </nav>

      <div className="main-layout">
        <section className="dashboard-content">
          <div className="glass-container floating" style={{ maxWidth: 'none', margin: 0 }}>
            <div className="trust-badge">
              <div className="avatar-stack">
                <div style={{ background: '#444' }}></div>
                <div style={{ background: '#666' }}></div>
                <div style={{ background: '#888' }}></div>
              </div>
              <span>56,608 reputations verified this week</span>
            </div>

            <h1 className="luxury-heading" style={{ fontSize: '4.5rem' }}>
              On-Chain <span className="amber-text">Reputation</span>
            </h1>

            {!connected ? (
              <div className="primary-actions">
                <div className="luxury-btn">
                  <span style={{ opacity: 0.5 }}>⚡</span> Privacy First
                </div>
                <div className="luxury-btn">
                  <span style={{ opacity: 0.5 }}>🛡️</span> Sybil Proof
                </div>
              </div>
            ) : (
              <div className="fade-in">
                {loading ? (
                  <div className="amber-text" style={{ fontWeight: 700, margin: '40px 0' }}>Decoding Protocol Identity...</div>
                ) : scoreData && (
                  <>
                    <div style={{ fontSize: '7.6rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: 'var(--primary)', lineHeight: 1 }}>
                      {scoreData.fairscore}
                    </div>
                    <div className="stat-label" style={{ marginBottom: '40px' }}>FairScore Reputation Rank</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                        <div className="stat-label" style={{ fontSize: '0.65rem' }}>On-Chain Power</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{scoreData.fairscore_base}</div>
                      </div>
                      <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                        <div className="stat-label" style={{ fontSize: '0.65rem' }}>Social Influence</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }} className="amber-text">{scoreData.social_score}</div>
                      </div>
                    </div>

                    <div className="stat-grid">
                      <div className="stat-item">
                        <div className="stat-label">Tier Status</div>
                        <div className="stat-value amber-text" style={{ textTransform: 'capitalize' }}>{scoreData.tier}</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Calculated APR</div>
                        <div className="stat-value">{(5.0 + aprBonus).toFixed(1)}%</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Badges</div>
                        <div className="stat-value">{scoreData.badges.length}</div>
                      </div>
                    </div>

                    <div className="access-panel">
                      <h3 style={{ fontSize: '0.9rem', marginBottom: '16px', fontWeight: 700 }}>CURRENT ACCESS & UTILITY</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className={`access-badge ${scoreData.tier === 'platinum' ? 'unlocked' : 'locked'}`}>
                              {scoreData.tier === 'platinum' ? 'Unlocked' : 'Locked'}
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>Priority Access to $FAIR Token Sales</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Platinum Gated</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="access-badge unlocked">Unlocked</span>
                            <span style={{ fontSize: '0.85rem' }}>Advanced Reputation Analytics</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Silver+ Gated</span>
                        </div>
                      </div>
                    </div>

                    <button className="luxury-btn active" style={{ width: '100%', marginTop: '40px', borderRadius: '100px' }}>
                      Claim Tier Rewards
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="sidebar">
          <div className="side-card">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '20px' }}>Global Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <div style={{ fontSize: '0.75rem', opacity: 0.5, padding: '20px 0' }}>No on-chain records found.</div>
            ) : leaderboard.map(item => (
              <div key={item.rank} className="leaderboard-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="rank-badge">{item.rank}</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.wallet}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.score}</span>
              </div>
            ))}
          </div>

          <div className="side-card">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '20px' }}>Tier Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {distribution.map(d => (
                <div key={d.tier}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span>{d.tier}</span>
                    <span>{d.count} wallets</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                    <div style={{ height: '100%', width: `${(d.count / 2000) * 100}%`, background: d.color, borderRadius: '10px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="side-card" style={{ opacity: 0.5 }}>
            <p style={{ fontSize: '0.75rem' }}>Rankings updated every hour based on FairScale real-time neural indexing.</p>
          </div>
        </section>
      </div>

      <div className="ticker-wrap">
        <div className="ticker">
          {tickerItems.concat(tickerItems).map((item, i) => (
            <div key={i} className="ticker-item">{item} •</div>
          ))}
        </div>
      </div>

      <footer style={{ padding: '80px 60px 140px', textAlign: 'center', opacity: 0.8, fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', marginTop: '100px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '40px', fontWeight: 600 }}>
          <a href="https://docs.fairscale.xyz" target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>Developer Docs</a>
          <a href="https://t.me/+XF23ay9aY1AzYzlk" target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
          <a href="https://x.com/fairscalexyz" target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>X/Twitter</a>
        </div>
        <p style={{ opacity: 0.5 }}>ReputaGate © 2025. Built with FairScale Protocol.</p>
      </footer>
    </div>
  );
}

export default App;
