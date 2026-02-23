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

  return (
    <div className="app-wrapper">
      <nav>
        <div className="logo">Reputa<span className="amber-text">Gate</span></div>
        <WalletMultiButton />
      </nav>

      <section className="hero-section">
        <div className="glass-container floating">
          <div className="trust-badge">
            <div className="avatar-stack">
              <div style={{ background: '#444' }}></div>
              <div style={{ background: '#666' }}></div>
              <div style={{ background: '#888' }}></div>
            </div>
            <span>56,608 scores generated this week</span>
          </div>

          <h1 className="luxury-heading">
            Your On-Chain <br />
            <span className="amber-text">Reputation Score</span>
          </h1>

          <p className="subtitle">
            ReputaGate uses FairScale's high-integrity scoring to unlock premium yields and gated DeFi ecosystems.
          </p>

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
                <div className="amber-text" style={{ fontWeight: 700, margin: '40px 0' }}>Analyzing Protocol Identity...</div>
              ) : scoreData && (
                <>
                  <div style={{ fontSize: '7.6rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: 'var(--primary)', lineHeight: 1 }}>
                    {scoreData.fairscore}
                  </div>
                  <div className="stat-label" style={{ marginBottom: '40px' }}>Identity Credit Score</div>

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
                      <div className="stat-label">Active Yield</div>
                      <div className="stat-value">{(4.2 + aprBonus).toFixed(1)}%</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-label">Badges</div>
                      <div className="stat-value">{scoreData.badges.length}</div>
                    </div>
                  </div>

                  <button className="luxury-btn active" style={{ width: '100%', marginTop: '40px', borderRadius: '100px' }}>
                    Enter Gated Vaults
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="stat-grid" style={{ maxWidth: '800px', width: '100%', padding: '0 40px' }}>
          <div className="stat-item">
            <div className="stat-label">TVL Protected</div>
            <div className="stat-value">$1.42B</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Audit Grade</div>
            <div className="stat-value amber-text">AAA+</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Network</div>
            <div className="stat-value">Solana Mainnet</div>
          </div>
        </div>
      </section>

      <footer style={{ padding: '80px 60px', textAlign: 'center', opacity: 0.8, fontSize: '0.9rem', borderTop: '1px solid var(--border-color)', marginTop: '100px' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'center', gap: '40px', fontWeight: 600 }}>
          <a href="https://docs.fairscale.xyz" target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>Developer Docs</a>
          <a href="https://t.me/+XF23ay9aY1AzYzlk" target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>Support</a>
          <a href="https://x.com/fairscalexyz" target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>X/Twitter</a>
        </div>
        <p style={{ opacity: 0.5 }}>Built with FairScale Protocol. Integrity is the New Liquid.</p>
      </footer>
    </div>
  );
}

export default App;
