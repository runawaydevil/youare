/**
 * YouAre - Globo de Conscientização sobre Privacidade
 * Componente principal da aplicação
 * Desenvolvido por Grupo Murad - 2026
 */

import { useState, useCallback, useMemo } from 'react';
import { Globe } from './components/Globe';
import { InfoPanel } from './components/InfoPanel';
import { AdAuction } from './components/AdAuction';
import { useWebSocket } from './hooks/useWebSocket';
import type { VisitorInfo } from './types';
import './App.css';

export default function App() {
  const { connected, visitors, currentVisitor, aiLoading, aiCreditsExhausted, totalUniqueVisitors } = useWebSocket();
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  // Get the selected visitor from the visitors array (always up-to-date)
  const selectedVisitor = useMemo(() => {
    if (!selectedVisitorId) return null;
    return visitors.find(v => v.id === selectedVisitorId) || null;
  }, [selectedVisitorId, visitors]);

  const handleVisitorClick = useCallback((visitor: VisitorInfo) => {
    // If clicking the same visitor, close the popup
    if (selectedVisitorId === visitor.id) {
      setSelectedVisitorId(null);
    } else {
      setSelectedVisitorId(visitor.id);
    }
  }, [selectedVisitorId]);

  const handleCloseSelected = useCallback(() => {
    setSelectedVisitorId(null);
  }, []);

  // Determine which visitor to show in the panel
  const displayedVisitor = selectedVisitor || currentVisitor;
  const isDisplayingCurrentUser = displayedVisitor?.id === currentVisitor?.id;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">!?</span>
          <h1>Suas Informações</h1>
        </div>
        <div className="app-stats">
          <div className="stat">
            <span className="stat-value">{visitors.length}</span>
            <span className="stat-label">Online</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalUniqueVisitors.toLocaleString()}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot" />
            {connected ? 'Ao Vivo' : 'Conectando...'}
          </div>
        </div>
      </header>

      {/* AI Credits Exhausted Banner */}
      {aiCreditsExhausted && (
        <div className="ai-credits-banner">
          <span className="banner-icon">:(</span>
          <span className="banner-text">
            Créditos de IA esgotados! O sistema está usando análise baseada em regras.
          </span>
        </div>
      )}

      {/* Left Panel - Ad Auction */}
      <aside className="left-panel">
        <AdAuction visitor={currentVisitor} />
      </aside>

      {/* Globe */}
      <div className="globe-container">
        <Globe
          visitors={visitors}
          currentVisitorId={currentVisitor?.id || null}
          onVisitorClick={handleVisitorClick}
        />
      </div>

      {/* Right Panel - Info Panel */}
      <InfoPanel
        visitor={displayedVisitor}
        isCurrentUser={isDisplayingCurrentUser ?? true}
        onClose={selectedVisitorId ? handleCloseSelected : undefined}
        aiLoading={aiLoading && isDisplayingCurrentUser}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Este site demonstra quais informações os sites podem coletar sobre você.
          <a href="https://github.com/runawaydevil/youare" target="_blank" rel="noopener noreferrer">
            Ver no GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
