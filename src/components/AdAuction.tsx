/**
 * Componente de Leilão de Anúncios
 * Mostra resultados simulados de leilão RTB - Como empresas fazem lances para mostrar anúncios
 * TRANSPARENTE: Esta é uma simulação para fins educacionais
 */

import { useState, useEffect, useCallback } from 'react';
import { runAdAuction, AD_PREFERENCE_PAGES, AD_COMPANIES, type AuctionResult, type AdBid } from '../utils/adAuction';
import type { VisitorInfo } from '../types';
import './AdAuction.css';

interface AdAuctionProps {
  visitor?: VisitorInfo | null;
}

export function AdAuction({ visitor }: AdAuctionProps) {
  const [auctionResult, setAuctionResult] = useState<AuctionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllBids, setShowAllBids] = useState(true);
  const [showValueBreakdown, setShowValueBreakdown] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const runAuction = useCallback(async () => {
    if (!visitor) return;

    setIsLoading(true);
    try {
      const result = await runAdAuction(visitor);
      setAuctionResult(result);
    } catch (error) {
      console.error('Auction error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [visitor]);

  // Run auction when visitor data arrives
  useEffect(() => {
    if (visitor?.client && !auctionResult && !isLoading) {
      runAuction();
    }
  }, [visitor, auctionResult, isLoading, runAuction]);

  const formatCPM = (cpm: number) => `$${cpm.toFixed(2)}`;

  // Separate bids by status
  const activeBids = auctionResult?.bids.filter(b => b.status === 'bid') || [];
  const noBids = auctionResult?.bids.filter(b => b.status === 'no-bid') || [];

  // Get country info
  const country = visitor?.server?.geo?.country || 'Desconhecido';
  const countryCode = visitor?.server?.geo?.countryCode || '';

  return (
    <div className={`ad-auction-panel ${mobileExpanded ? 'mobile-expanded' : ''}`}>
      {/* Mobile Collapsed Bar */}
      <button
        className="mobile-auction-bar"
        onClick={() => setMobileExpanded(!mobileExpanded)}
      >
        <span className="mobile-bar-left">
          <span className="live-dot"></span>
          <span className="mobile-bar-label">Você Vale:</span>
          {auctionResult?.winner && auctionResult.aiPowered ? (
            <>
              <span className="mobile-bar-value">${auctionResult.winner.cpm.toFixed(2)}</span>
              <span className="mobile-bar-company">para {auctionResult.winner.bidderName}</span>
            </>
          ) : auctionResult && !auctionResult.aiPowered ? (
            <span className="mobile-bar-loading">IA indisponível</span>
          ) : isLoading ? (
            <span className="mobile-bar-loading">Calculando...</span>
          ) : (
            <span className="mobile-bar-loading">Carregando perfil...</span>
          )}
        </span>
        <span className="mobile-bar-right">
          <span className={`mobile-bar-arrow ${mobileExpanded ? 'expanded' : ''}`}>▼</span>
        </span>
      </button>

      {/* Desktop Header */}
      <div className="auction-panel-header desktop-only">
        <div className="auction-panel-title">
          <span className="live-dot"></span>
          <h2>Leilão de Anúncios</h2>
        </div>
        <p className="auction-panel-subtitle">
          {auctionResult ? `${auctionResult.totalBidders} empresas fazendo lances pela sua atenção` : 'Empresas fazendo lances pela sua atenção'}
        </p>
      </div>

      {/* Main Content */}
      <div className="auction-panel-content">
        {/* Loading State */}
        {isLoading && (
          <div className="auction-loading-state">
            <div className="auction-loading-animation">
              <div className="bid-pulse"></div>
              <div className="bid-pulse delay-1"></div>
              <div className="bid-pulse delay-2"></div>
            </div>
            <span className="loading-text">Analisando seu perfil...</span>
            <span className="loading-count">IA selecionando licitantes relevantes para sua localização</span>
          </div>
        )}

        {/* Waiting for visitor data */}
        {!visitor?.client && !isLoading && (
          <div className="auction-loading-state">
            <div className="auction-loading-animation">
              <div className="bid-pulse"></div>
              <div className="bid-pulse delay-1"></div>
              <div className="bid-pulse delay-2"></div>
            </div>
            <span className="loading-text">Coletando seus dados...</span>
            <span className="loading-count">Fingerprinting em andamento</span>
          </div>
        )}

        {/* Results - Only show if AI powered */}
        {auctionResult && !isLoading && auctionResult.aiPowered && (
          <>
            {/* Winner Card */}
            {auctionResult.winner && (
              <div className="winner-card">
                <div className="winner-card-badge"><span className="icon-trophy"></span> MAIOR LANCE</div>
                <div className="winner-card-content">
                  <div className="winner-card-name">{auctionResult.winner.bidderName}</div>
                  <div className="winner-card-bid">{formatCPM(auctionResult.winner.cpm)}</div>
                  <div className="winner-card-unit">por 1.000 impressões (CPM)</div>
                </div>
                <div className="winner-card-reason">
                  "{auctionResult.winner.reason}"
                </div>
              </div>
            )}

            {/* Value Breakdown - Why This Price */}
            {auctionResult.userValueBreakdown.length > 0 && (
              <div className="value-breakdown-container">
                <button
                  className="value-breakdown-header"
                  onClick={() => setShowValueBreakdown(!showValueBreakdown)}
                >
                  <span><span className="icon-chart"></span> Por Que Este Preço?</span>
                  <span className="expand-icon">{showValueBreakdown ? '−' : '+'}</span>
                </button>

                {showValueBreakdown && (
                  <div className="value-breakdown-list">
                    {auctionResult.userValueBreakdown.map((factor, index) => (
                      <div key={index} className={`value-factor ${factor.impactValue >= 1 ? 'positive' : 'negative'}`}>
                        <span className={`factor-icon ${factor.impactValue >= 1 ? 'up' : 'down'}`}></span>
                        <div className="factor-content">
                          <div className="factor-header">
                            <span className="factor-name">{factor.factor}</span>
                            <span className={`factor-impact ${factor.impactValue >= 1 ? 'positive' : 'negative'}`}>
                              {factor.impact}
                            </span>
                          </div>
                          <span className="factor-description">{factor.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Stats Row */}
            <div className="auction-stats-row">
              <div className="stat-box">
                <span className="stat-number">{activeBids.length}</span>
                <span className="stat-text">Licitantes</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{noBids.length}</span>
                <span className="stat-text">Sem Lance</span>
              </div>
              <div className="stat-box country-stat">
                <span className="stat-number">{countryCode || '??'}</span>
                <span className="stat-text">{country}</span>
              </div>
            </div>

            {/* All Bids */}
            <div className="bids-container">
              <button
                className="bids-header-btn"
                onClick={() => setShowAllBids(!showAllBids)}
              >
                <span>Todos os Lances ({activeBids.length})</span>
                <span className="expand-icon">{showAllBids ? '−' : '+'}</span>
              </button>

              {showAllBids && (
                <div className="bids-table">
                  {activeBids.map((bid, index) => (
                    <BidRow
                      key={`${bid.bidder}-${index}`}
                      bid={bid}
                      isWinner={auctionResult.winner?.bidder === bid.bidder}
                      rank={index + 1}
                    />
                  ))}

                  {/* No-bids */}
                  {noBids.length > 0 && (
                    <div className="failed-bids">
                      <div className="failed-bids-header">Não Fizeram Lance:</div>
                      {noBids.slice(0, 5).map((bid, index) => (
                        <div key={`nobid-${index}`} className="failed-bid-row">
                          <span className="failed-name">{bid.bidderName}</span>
                          <span className="failed-reason">{bid.reason}</span>
                        </div>
                      ))}
                      {noBids.length > 5 && (
                        <div className="failed-bid-row more">
                          +{noBids.length - 5} empresas a mais não fizeram lance
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Explanation */}
            <div className="auction-info-box">
              <p>
                <strong><span className="icon-bolt"></span> Isso acontece em &lt;100ms</strong> toda vez que você visita um site com anúncios.
                Seus dados são vendidos ao maior licitante antes mesmo da página carregar.
              </p>
              <p className="ai-note">
                <span className="icon-sparkle"></span> Lances simulados gerados por IA baseados nos seus dados reais de perfil
                <span className="ai-note-explain">(Leilões RTB reais requerem licenças de editor, contratos SSP/DSP e certificação IAB. Esta demonstração visualiza o que acontece a portas fechadas usando IA para gerar lances realistas baseados nos seus dados reais de fingerprint.)</span>
              </p>
            </div>
          </>
        )}

        {/* Error State - AI not available */}
        {auctionResult && !isLoading && !auctionResult.aiPowered && (
          <div className="auction-error-state">
            <div className="error-icon">!</div>
            <p className="error-text">Leilão de IA temporariamente indisponível</p>
            <p className="error-subtext">Confira seus perfis de anúncios reais abaixo</p>
          </div>
        )}

        {/* Ad Preferences Section */}
        <div className="preferences-container">
          <button
            className="preferences-header-btn"
            onClick={() => setShowPreferences(!showPreferences)}
          >
            <span className="icon-search"></span>
            <span>Veja Seus Perfis de Anúncios Reais</span>
            <span className="expand-icon">{showPreferences ? '−' : '+'}</span>
          </button>

          {showPreferences && (
            <div className="preferences-links-list">
              <p className="prefs-intro">
                Essas empresas têm perfis sobre você. Veja o que elas sabem:
              </p>
              {Object.values(AD_PREFERENCE_PAGES).map((page) => (
                <a
                  key={page.name}
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pref-link"
                >
                  <span className="pref-link-name">{page.name}</span>
                  <span className="pref-link-desc">{page.description}</span>
                  <span className="pref-link-arrow">→</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BidRowProps {
  bid: AdBid;
  isWinner: boolean;
  rank: number;
}

function BidRow({ bid, isWinner, rank }: BidRowProps) {
  const [showReason, setShowReason] = useState(false);
  const company = AD_COMPANIES[bid.bidder];

  return (
    <div
      className={`bid-table-row ${isWinner ? 'winner' : ''} ${bid.category}`}
      onClick={() => setShowReason(!showReason)}
    >
      <span className="bid-rank">#{rank}</span>
      <div className="bid-info">
        <span className="bid-name">{bid.bidderName}</span>
        {company?.specialty && (
          <span className="bid-specialty">{company.specialty}</span>
        )}
        {showReason && (
          <span className="bid-reason">{bid.reason}</span>
        )}
      </div>
      <span className="bid-amount">{bid.cpm.toFixed(2)}</span>
      <span className={`bid-category-tag ${bid.category}`}>
        <span className={`icon-category icon-${bid.category}`}></span>
      </span>
      {isWinner && <span className="winner-tag">GANHOU</span>}
    </div>
  );
}
