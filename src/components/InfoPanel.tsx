/**
 * Componente de Painel de Informações
 * Exibe informações coletadas sobre o visitante em seções categorizadas
 */

import type { VisitorInfo } from '../types';
import './InfoPanel.css';

interface InfoPanelProps {
  visitor: VisitorInfo | null;
  isCurrentUser: boolean;
  onClose?: () => void;
  aiLoading?: boolean;
}

interface InfoRowProps {
  label: string;
  value: string | number | boolean | null | undefined;
  tooltip?: string;
  warning?: boolean;
}

function InfoRow({ label, value, tooltip, warning }: InfoRowProps) {
  const displayValue =
    value === null || value === undefined
      ? 'N/A'
      : typeof value === 'boolean'
        ? value
          ? 'Sim'
          : 'Não'
        : String(value);

  return (
    <div className={`info-row ${warning ? 'warning' : ''}`} title={tooltip}>
      <span className="info-label">{label}</span>
      <span className="info-value">{displayValue}</span>
    </div>
  );
}

interface InfoSectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  collapsed?: boolean;
}

function InfoSection({ title, icon, children }: InfoSectionProps) {
  return (
    <div className="info-section">
      <div className="info-section-header">
        <span className="info-section-icon">{icon}</span>
        <span className="info-section-title">{title}</span>
      </div>
      <div className="info-section-content">{children}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="loading-skeleton">
      <div className="skeleton-row">
        <div className="skeleton-label"></div>
        <div className="skeleton-value"></div>
      </div>
      <div className="skeleton-row">
        <div className="skeleton-label"></div>
        <div className="skeleton-value"></div>
      </div>
      <div className="skeleton-row">
        <div className="skeleton-label"></div>
        <div className="skeleton-value"></div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function InfoPanel({ visitor, isCurrentUser, onClose, aiLoading }: InfoPanelProps) {
  if (!visitor) {
    return (
      <div className="info-panel">
        <div className="info-panel-header">
          <h2>Suas Informações</h2>
        </div>
        <div className="info-panel-content">
          <p className="loading-message">Conectando...</p>
        </div>
      </div>
    );
  }

  const { server, client } = visitor;

  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <h2>{isCurrentUser ? 'Suas Informações' : 'Informações do Visitante'}</h2>
        {!isCurrentUser && onClose && (
          <button className="close-button" onClick={onClose}>
            x
          </button>
        )}
        {isCurrentUser && <span className="you-badge">Você</span>}
      </div>

      <div className="info-panel-content">
        {/* Privacy notice for other visitors */}
        {!isCurrentUser && (
          <div className="privacy-notice">
            Alguns dados estão ocultos para proteger a privacidade deste visitante. Localização no mapa e coordenadas são aproximadas (~100km).
          </div>
        )}

        {/* Unique Fingerprint ID - Show at top! */}
        {client && (
          <InfoSection title="Seus IDs Únicos" icon="!">
            <InfoRow
              label="Impressão Digital do Navegador"
              value={client.fingerprintId}
              tooltip="Único para este navegador - muda se você trocar de navegador"
              warning
            />
            <InfoRow
              label="ID Cross-Browser"
              value={client.crossBrowserId}
              tooltip="MESMO ID no Chrome, Firefox, Safari! Baseado em hardware."
              warning
            />
            <InfoRow
              label="Confiança"
              value={`${client.fingerprintConfidence}%`}
              tooltip="Quão confiantes estamos de que este ID é único para você"
            />
          </InfoSection>
        )}

        {/* Location Section - Second! */}
        <InfoSection title="Localização" icon="O">
          <InfoRow
            label="Endereço IP"
            value={server.ip}
            tooltip="Seu endereço IP público visível para todos os sites"
            warning={isCurrentUser}
          />
          {server.geo && (
            <>
              <InfoRow label="Cidade" value={server.geo.city} />
              <InfoRow label="Região" value={server.geo.region} />
              <InfoRow label="País" value={`${server.geo.country} (${server.geo.countryCode})`} />
              <InfoRow
                label="Coordenadas"
                value={isCurrentUser
                  ? `${server.geo.lat.toFixed(4)}, ${server.geo.lng.toFixed(4)}`
                  : `~${Math.round(server.geo.lat)}, ${Math.round(server.geo.lng)} (APROX)`
                }
                tooltip={isCurrentUser ? undefined : "Localização aproximada para privacidade (~100km)"}
                warning={isCurrentUser}
              />
              <InfoRow label="Fuso Horário" value={server.geo.timezone} />
              {isCurrentUser && (
                <>
                  <InfoRow label="ISP" value={server.geo.isp} tooltip="Seu Provedor de Serviços de Internet" />
                  <InfoRow label="Organização" value={server.geo.org} />
                </>
              )}
            </>
          )}
        </InfoSection>

        {/* User Profile - What advertisers think about you */}
        {client && (
          <InfoSection title={client.userProfile.aiGenerated ? "Análise de IA Sobre Você" : "O Que os Anunciantes Sabem Sobre Você"} icon="$">
            <InfoRow
              label="Pontuação Humana"
              value={`${client.userProfile.humanScore}%`}
              tooltip="Quão confiantes estamos de que você é humano"
              warning={client.userProfile.humanScore < 70}
            />
            <InfoRow
              label="Risco de Fraude"
              value={`${client.userProfile.fraudRiskScore}%`}
              tooltip="Pontuação de risco usada por processadores de pagamento"
              warning={client.userProfile.fraudRiskScore > 30}
            />
            <InfoRow
              label="Nível do Dispositivo"
              value={client.userProfile.deviceTier}
              tooltip="Usado para determinar seu poder de compra"
            />
            <InfoRow
              label="Valor do Dispositivo"
              value={client.userProfile.estimatedDeviceValue}
              tooltip="Valor estimado do seu dispositivo"
              warning
            />
            <InfoRow
              label="Idade do Dispositivo"
              value={client.userProfile.deviceAge}
            />
            <InfoRow
              label="País"
              value={client.userProfile.likelyCountry}
            />
            {client.userProfile.incomeLevel && (
              <InfoRow
                label="Nível de Renda"
                value={client.userProfile.incomeLevel}
                tooltip="Inferido a partir do dispositivo e padrões de navegação"
                warning
              />
            )}
            {client.userProfile.ageRange && (
              <InfoRow
                label="Faixa Etária"
                value={client.userProfile.ageRange}
                tooltip="Idade estimada baseada no dispositivo e preferências"
                warning
              />
            )}
            {client.userProfile.occupation && (
              <InfoRow
                label="Ocupação"
                value={client.userProfile.occupation}
                tooltip="Melhor estimativa baseada em ferramentas e padrões"
                warning
              />
            )}
            {client.userProfile.educationLevel && client.userProfile.educationLevel !== 'unknown' && (
              <InfoRow
                label="Educação"
                value={client.userProfile.educationLevel}
                tooltip={client.userProfile.educationReason}
                warning
              />
            )}
            {client.userProfile.workStyle && (
              <InfoRow
                label="Estilo de Trabalho"
                value={client.userProfile.workStyle}
                tooltip={client.userProfile.workReason}
                warning
              />
            )}
            {client.userProfile.lifeSituation && (
              <InfoRow
                label="Situação de Vida"
                value={client.userProfile.lifeSituation}
                warning
              />
            )}
          </InfoSection>
        )}

        {/* Creepy Personal Life Inferences */}
        {client && (aiLoading || client.userProfile.aiGenerated) && (
          <InfoSection title="Sua Vida Pessoal (Palpites da IA)" icon="!">
            {aiLoading && !client.userProfile.aiGenerated && <LoadingSkeleton />}
            {client.userProfile.relationshipStatus && client.userProfile.relationshipStatus !== 'unknown' && (
              <InfoRow
                label="Relacionamento"
                value={client.userProfile.relationshipStatus}
                tooltip={client.userProfile.relationshipReason}
                warning
              />
            )}
            {client.userProfile.likelyParent !== undefined && (
              <InfoRow
                label="Pai/Mãe"
                value={client.userProfile.likelyParent ? 'Provavelmente sim' : 'Provavelmente não'}
                tooltip={client.userProfile.parentReason}
                warning={client.userProfile.likelyParent}
              />
            )}
            {client.userProfile.petOwner !== undefined && (
              <InfoRow
                label="Dono de Pet"
                value={client.userProfile.petOwner ? (client.userProfile.petType || 'Sim') : 'Não'}
                warning={client.userProfile.petOwner}
              />
            )}
            {client.userProfile.homeowner !== undefined && (
              <InfoRow
                label="Proprietário"
                value={client.userProfile.homeowner ? 'Provavelmente sim' : 'Inquilino'}
                tooltip={client.userProfile.homeReason}
                warning
              />
            )}
            {client.userProfile.carOwner !== undefined && (
              <InfoRow
                label="Dono de Carro"
                value={client.userProfile.carOwner ? (client.userProfile.carType || 'Sim') : 'Não'}
                warning={client.userProfile.carOwner}
              />
            )}
            {client.userProfile.socialLife && (
              <InfoRow
                label="Tipo Social"
                value={client.userProfile.socialLife}
                tooltip={client.userProfile.socialReason}
                warning
              />
            )}
          </InfoSection>
        )}

        {/* Mental & Physical State */}
        {client && (aiLoading || client.userProfile.aiGenerated) && (
          <InfoSection title="Seu Estado Mental e Físico" icon="H">
            {aiLoading && !client.userProfile.aiGenerated && <LoadingSkeleton />}
            {client.userProfile.stressLevel && (
              <InfoRow
                label="Nível de Estresse"
                value={client.userProfile.stressLevel}
                tooltip={client.userProfile.stressReason}
                warning={client.userProfile.stressLevel === 'high' || client.userProfile.stressLevel === 'burnout'}
              />
            )}
            {client.userProfile.sleepSchedule && (
              <InfoRow
                label="Horário de Sono"
                value={client.userProfile.sleepSchedule}
                tooltip={client.userProfile.sleepReason}
                warning
              />
            )}
            {client.userProfile.fitnessLevel && (
              <InfoRow
                label="Nível de Condicionamento"
                value={client.userProfile.fitnessLevel}
                tooltip={client.userProfile.fitnessReason}
                warning
              />
            )}
            {client.userProfile.healthConscious !== undefined && (
              <InfoRow
                label="Consciente da Saúde"
                value={client.userProfile.healthConscious ? 'Sim' : 'Não muito'}
                tooltip={client.userProfile.healthReason}
              />
            )}
            {client.userProfile.dietaryPreference && (
              <InfoRow
                label="Dieta"
                value={client.userProfile.dietaryPreference}
                warning
              />
            )}
          </InfoSection>
        )}

        {/* Lifestyle & Habits */}
        {client && (aiLoading || client.userProfile.aiGenerated) && (
          <InfoSection title="Seu Estilo de Vida e Hábitos" icon="L">
            {aiLoading && !client.userProfile.aiGenerated && <LoadingSkeleton />}
            {client.userProfile.coffeeOrTea && (
              <InfoRow
                label="Cafeína"
                value={client.userProfile.coffeeOrTea === 'coffee' ? 'Pessoa do café' : client.userProfile.coffeeOrTea === 'tea' ? 'Pessoa do chá' : client.userProfile.coffeeOrTea}
                warning
              />
            )}
            {client.userProfile.drinksAlcohol !== undefined && (
              <InfoRow
                label="Bebe Álcool"
                value={client.userProfile.drinksAlcohol ? 'Provavelmente' : 'Improvável'}
              />
            )}
            {client.userProfile.smokes !== undefined && (
              <InfoRow
                label="Fuma"
                value={client.userProfile.smokes ? 'Possivelmente' : 'Improvável'}
                warning={client.userProfile.smokes}
              />
            )}
            {client.userProfile.travelFrequency && (
              <InfoRow
                label="Viagens"
                value={client.userProfile.travelFrequency}
                tooltip={client.userProfile.travelReason}
              />
            )}
          </InfoSection>
        )}

        {/* Financial & Shopping */}
        {client && (aiLoading || client.userProfile.aiGenerated) && (
          <InfoSection title="Seu Perfil Financeiro" icon="$">
            {aiLoading && !client.userProfile.aiGenerated && <LoadingSkeleton />}
            {client.userProfile.financialHealth && (
              <InfoRow
                label="Saúde Financeira"
                value={client.userProfile.financialHealth}
                tooltip={client.userProfile.financialReason}
                warning
              />
            )}
            {client.userProfile.shoppingHabits && (
              <InfoRow
                label="Estilo de Compras"
                value={client.userProfile.shoppingHabits}
                tooltip={client.userProfile.shoppingReason}
                warning
              />
            )}
            {client.userProfile.brandPreference && client.userProfile.brandPreference.length > 0 && (
              <InfoRow
                label="Afinidade com Marcas"
                value={client.userProfile.brandPreference.slice(0, 3).join(', ')}
                warning
              />
            )}
          </InfoSection>
        )}

        {/* Entertainment & Media */}
        {client && (aiLoading || (client.userProfile.aiGenerated && (client.userProfile.streamingServices?.length || client.userProfile.musicTaste?.length))) && (
          <InfoSection title="Seu Entretenimento" icon="E">
            {aiLoading && !client.userProfile.aiGenerated && <LoadingSkeleton />}
            {client.userProfile.streamingServices && client.userProfile.streamingServices.length > 0 && (
              <InfoRow
                label="Streaming"
                value={client.userProfile.streamingServices.join(', ')}
                warning
              />
            )}
            {client.userProfile.musicTaste && client.userProfile.musicTaste.length > 0 && (
              <InfoRow
                label="Gosto Musical"
                value={client.userProfile.musicTaste.join(', ')}
                warning
              />
            )}
          </InfoSection>
        )}

        {/* Life Events */}
        {client && client.userProfile.lifeEvents && client.userProfile.lifeEvents.length > 0 && (
          <InfoSection title="Eventos Recentes da Vida" icon="!">
            {client.userProfile.lifeEvents.map((event) => (
              <InfoRow key={event} label={event} value="Detectado" warning />
            ))}
          </InfoSection>
        )}

        {/* Political (if detected) */}
        {client && client.userProfile.politicalLeaning && client.userProfile.politicalLeaning !== 'unknown' && (
          <InfoSection title="Inferência Política" icon="P">
            <InfoRow
              label="Tendência"
              value={client.userProfile.politicalLeaning}
              tooltip={client.userProfile.politicalReason}
              warning
            />
          </InfoSection>
        )}

        {/* Creepy Insights Summary */}
        {client && client.userProfile.creepyInsights && client.userProfile.creepyInsights.length > 0 && (
          <InfoSection title="Outros Insights Perturbadores" icon="!">
            {client.userProfile.creepyInsights.map((insight, i) => (
              <InfoRow key={i} label={`Insight ${i + 1}`} value={insight} warning />
            ))}
          </InfoSection>
        )}

        {/* User Type Detection */}
        {client && (
          <InfoSection title="Quem Eles Acham Que Você É" icon="U">
            <InfoRow
              label="Desenvolvedor"
              value={client.userProfile.likelyDeveloper ? `Sim (${client.userProfile.developerScore}%)` : `Não (${client.userProfile.developerScore}%)`}
              tooltip={client.userProfile.developerReason}
              warning={client.userProfile.likelyDeveloper}
            />
            <InfoRow
              label="Gamer"
              value={client.userProfile.likelyGamer ? `Sim (${client.userProfile.gamerScore}%)` : `Não (${client.userProfile.gamerScore}%)`}
              tooltip={client.userProfile.gamerReason}
              warning={client.userProfile.likelyGamer}
            />
            <InfoRow
              label="Designer"
              value={client.userProfile.likelyDesigner ? `Sim (${client.userProfile.designerScore}%)` : `Não (${client.userProfile.designerScore}%)`}
              tooltip={client.userProfile.designerReason}
              warning={client.userProfile.likelyDesigner}
            />
            <InfoRow
              label="Usuário Avançado"
              value={client.userProfile.likelyPowerUser ? `Sim (${client.userProfile.powerUserScore}%)` : `Não (${client.userProfile.powerUserScore}%)`}
              tooltip={client.userProfile.powerUserReason}
              warning={client.userProfile.likelyPowerUser}
            />
            <InfoRow
              label="Consciente da Privacidade"
              value={client.userProfile.privacyConscious ? `Sim (${client.userProfile.privacyScore}%)` : `Não (${client.userProfile.privacyScore}%)`}
              tooltip={client.userProfile.privacyReason}
            />
            <InfoRow
              label="Entusiasta de Tecnologia"
              value={client.userProfile.likelyTechSavvy}
            />
            <InfoRow
              label="Usuário Mobile"
              value={client.userProfile.likelyMobile}
            />
            <InfoRow
              label="Dispositivo de Trabalho"
              value={client.userProfile.likelyWorkDevice}
            />
          </InfoSection>
        )}

        {/* Personality Traits (AI only) */}
        {client && client.userProfile.personalityTraits && client.userProfile.personalityTraits.length > 0 && (
          <InfoSection title="Traços de Personalidade" icon="P">
            {client.userProfile.personalityTraits.map((trait) => (
              <InfoRow key={trait} label={trait} value="Detectado" warning />
            ))}
          </InfoSection>
        )}

        {/* Inferred Interests */}
        {client && client.userProfile.inferredInterests.length > 0 && (
          <InfoSection title="Interesses Inferidos" icon="*">
            {client.userProfile.inferredInterests.map((interest) => (
              <InfoRow key={interest} label={interest} value="Provavelmente interessado" warning />
            ))}
          </InfoSection>
        )}

        {/* Bot Indicators */}
        {client && client.userProfile.botIndicators.length > 0 && (
          <InfoSection title="Sinalizadores de Detecção de Bot" icon="!">
            {client.userProfile.botIndicators.map((indicator) => (
              <InfoRow key={indicator} label={indicator} value="Detectado" warning />
            ))}
          </InfoSection>
        )}

        {/* Fraud Indicators */}
        {client && client.userProfile.fraudIndicators.length > 0 && (
          <InfoSection title="Fatores de Risco de Fraude" icon="!">
            {client.userProfile.fraudIndicators.map((indicator) => (
              <InfoRow key={indicator} label={indicator} value="Sinalizado" warning />
            ))}
          </InfoSection>
        )}

        {/* Cross-Browser Tracking Factors */}
        {client && client.crossBrowserFactors.length > 0 && (
          <InfoSection title="Por Que Podemos Rastrear Você Entre Navegadores" icon="X">
            {client.crossBrowserFactors.map((factor, i) => (
              <InfoRow key={i} label={factor.split(':')[0]} value={factor.split(':')[1]?.trim() || 'Sim'} />
            ))}
          </InfoSection>
        )}


        {/* WebRTC Local IPs */}
        {client && client.webrtcLocalIPs.length > 0 && (
          <InfoSection title="Rede Local" icon="!">
            {client.webrtcLocalIPs.map((ip, i) => (
              <InfoRow
                key={ip}
                label={`IP Local ${i + 1}`}
                value={ip}
                tooltip="IP privado revelado via WebRTC - pode expor sua configuração de rede"
                warning
              />
            ))}
          </InfoSection>
        )}

        {/* Browser Section */}
        <InfoSection title="Navegador" icon="#">
          <InfoRow
            label="User Agent"
            value={server.userAgent.substring(0, 50) + (server.userAgent.length > 50 ? '...' : '')}
            tooltip={server.userAgent}
          />
          <InfoRow label="Idiomas" value={server.acceptLanguage.split(',')[0]} />
          <InfoRow label="Referrer" value={server.referer} />
          {client && (
            <>
              <InfoRow label="Plataforma" value={client.platform} />
              <InfoRow label="Idioma" value={client.language} />
              <InfoRow label="Não Rastrear" value={client.doNotTrack} />
              <InfoRow label="Controle Global de Privacidade" value={client.globalPrivacyControl} />
              <InfoRow label="Cookies Habilitados" value={client.cookiesEnabled} />
              <InfoRow label="LocalStorage" value={client.localStorageEnabled} />
              <InfoRow label="SessionStorage" value={client.sessionStorageEnabled} />
              <InfoRow label="IndexedDB" value={client.indexedDBEnabled} />
              <InfoRow label="Visualizador PDF" value={client.pdfViewerEnabled} />
            </>
          )}
        </InfoSection>

        {/* Client Hints - More accurate OS/device info */}
        {client?.clientHints && (
          <InfoSection title="Client Hints" icon="+">
            <InfoRow label="Arquitetura" value={client.clientHints.architecture} />
            <InfoRow label="Bits" value={client.clientHints.bitness ? `${client.clientHints.bitness}-bit` : null} />
            <InfoRow label="Mobile" value={client.clientHints.mobile} />
            <InfoRow label="Modelo" value={client.clientHints.model} />
            <InfoRow label="Versão da Plataforma" value={client.clientHints.platformVersion} />
            <InfoRow
              label="Versões do Navegador"
              value={
                client.clientHints.fullVersionList
                  ? client.clientHints.fullVersionList.substring(0, 40) + '...'
                  : null
              }
              tooltip={client.clientHints.fullVersionList || undefined}
            />
          </InfoSection>
        )}

        {/* Device Section */}
        {client && (
          <InfoSection title="Tela" icon="=">
            <InfoRow label="Tela" value={`${client.screenWidth} x ${client.screenHeight}`} tooltip="Resolução da tela" />
            <InfoRow label="Janela" value={`${client.windowWidth} x ${client.windowHeight}`} tooltip="Tamanho da janela do navegador" />
            <InfoRow label="Profundidade de Cor" value={`${client.screenColorDepth}-bit`} />
            <InfoRow label="Razão de Pixels" value={`${client.devicePixelRatio}x`} />
            <InfoRow label="Orientação" value={client.screenOrientation} />
            <InfoRow label="Pontos de Toque" value={client.maxTouchPoints} />
          </InfoSection>
        )}

        {/* Hardware Section */}
        {client && (
          <InfoSection title="Hardware" icon="*">
            <InfoRow label="Núcleos da CPU" value={client.hardwareConcurrency} tooltip="Número de processadores lógicos" />
            <InfoRow
              label="RAM"
              value={
                client.deviceMemory
                  ? `${client.deviceMemory} GB${client.deviceMemoryCapped ? ' (limitado)' : ''}`
                  : null
              }
              tooltip={
                client.deviceMemoryCapped
                  ? 'Navegador limita RAM em 8GB por privacidade - RAM real pode ser maior!'
                  : 'Memória aproximada do dispositivo'
              }
              warning={client.deviceMemoryCapped}
            />
            <InfoRow label="Fabricante da GPU" value={client.webglVendor} />
            <InfoRow
              label="GPU"
              value={
                client.webglRenderer
                  ? client.webglRenderer.substring(0, 40) + (client.webglRenderer.length > 40 ? '...' : '')
                  : null
              }
              tooltip={client.webglRenderer || undefined}
            />
            <InfoRow label="Versão WebGL" value={client.webglVersion} />
            <InfoRow label="Extensões WebGL" value={client.webglExtensions} />
          </InfoSection>
        )}

        {/* Network Section */}
        {client && (
          <InfoSection title="Rede" icon="~">
            <InfoRow
              label="Conexão"
              value={client.connectionType?.toUpperCase()}
              tooltip="Tipo de conexão efetiva (2G, 3G, 4G, etc.)"
            />
            <InfoRow label="Downlink" value={client.connectionDownlink ? `${client.connectionDownlink} Mbps` : null} />
            <InfoRow label="RTT" value={client.connectionRtt ? `${client.connectionRtt} ms` : null} tooltip="Estimativa de tempo de ida e volta" />
            <InfoRow label="Economia de Dados" value={client.connectionSaveData} tooltip="Modo de economia de dados habilitado" />
            <InfoRow label="Bateria" value={client.batteryLevel !== null ? `${client.batteryLevel}%` : null} />
            <InfoRow label="Carregando" value={client.batteryCharging} />
            <InfoRow label="WebRTC Suportado" value={client.webrtcSupported} />
          </InfoSection>
        )}

        {/* Media Devices */}
        {client?.mediaDevices && (
          <InfoSection title="Dispositivos de Mídia" icon="M">
            <InfoRow label="Microfones" value={client.mediaDevices.audioinput} />
            <InfoRow label="Câmeras" value={client.mediaDevices.videoinput} />
            <InfoRow label="Alto-falantes" value={client.mediaDevices.audiooutput} />
          </InfoSection>
        )}

        {/* Storage Section */}
        {client?.storageQuota && (
          <InfoSection title="Armazenamento" icon="D">
            <InfoRow label="Usado" value={formatBytes(client.storageQuota.usage)} />
            <InfoRow
              label="Cota"
              value={formatBytes(client.storageQuota.quota)}
              tooltip="Cota de armazenamento estimada - pode revelar tamanho do disco"
            />
            <InfoRow
              label="Uso %"
              value={`${((client.storageQuota.usage / client.storageQuota.quota) * 100).toFixed(2)}%`}
            />
          </InfoSection>
        )}

        {/* Permissions Section */}
        {client && Object.keys(client.permissions).length > 0 && (
          <InfoSection title="Permissões" icon="P">
            {Object.entries(client.permissions).map(([name, state]) => (
              <InfoRow key={name} label={name} value={state} />
            ))}
          </InfoSection>
        )}

        {/* API Support Section */}
        {client && (
          <InfoSection title="Suporte a APIs" icon="A">
            <InfoRow label="Bluetooth" value={client.bluetoothSupported} />
            <InfoRow label="USB" value={client.usbSupported} />
            <InfoRow label="MIDI" value={client.midiSupported} />
            <InfoRow label="Gamepads" value={client.gamepadsSupported} />
            <InfoRow label="WebGPU" value={client.webGPUSupported} />
            <InfoRow label="SharedArrayBuffer" value={client.sharedArrayBufferSupported} />
          </InfoSection>
        )}

        {/* Fingerprints Section */}
        {client && (
          <InfoSection title="Impressões Digitais" icon="@">
            <InfoRow label="Hash Canvas" value={client.canvasFingerprint} tooltip="Identificador único da renderização canvas" />
            <InfoRow label="Hash de Áudio" value={client.audioFingerprint} tooltip="Identificador único do processamento de áudio" />
            <InfoRow label="Hash WebGL" value={client.webglFingerprint} tooltip="Identificador único dos parâmetros WebGL" />
            <InfoRow label="Fontes Detectadas" value={client.fontsDetected.length} tooltip={client.fontsDetected.join(', ')} />
            <InfoRow label="Vozes de Fala" value={client.speechVoicesCount} tooltip="Número de vozes de texto para fala instaladas" />
            <InfoRow label="Hash de Vozes" value={client.speechVoicesHash} tooltip="Hash das vozes instaladas - muito único!" />
            <InfoRow label="Fuso Horário" value={client.timezone} />
            <InfoRow
              label="Offset TZ"
              value={`UTC${client.timezoneOffset > 0 ? '-' : '+'}${Math.abs(client.timezoneOffset / 60)}`}
            />
          </InfoSection>
        )}

        {/* Privacy & Tracking Section */}
        {client && (
          <InfoSection title="Detecção de Rastreamento" icon="!">
            <InfoRow
              label="Bloqueador de Anúncios"
              value={client.adBlockerDetected === null ? 'Desconhecido' : client.adBlockerDetected ? 'Detectado' : 'Não detectado'}
              tooltip="Se um bloqueador de anúncios está ativo"
            />
            <InfoRow label="Não Rastrear" value={client.doNotTrack ? 'Habilitado' : 'Desabilitado'} />
            <InfoRow
              label="Controle Global de Privacidade"
              value={client.globalPrivacyControl === null ? 'N/A' : client.globalPrivacyControl ? 'Habilitado' : 'Desabilitado'}
            />
          </InfoSection>
        )}

        {/* Browser Detection */}
        {client && (
          <InfoSection title="Análise do Navegador" icon="B">
            <InfoRow label="Navegador" value={`${client.browserName} ${client.browserVersion}`} />
            <InfoRow label="Família de Hardware" value={client.hardwareFamily} />
            <InfoRow
              label="Modo Anônimo"
              value={client.isIncognito === null ? 'Desconhecido' : client.isIncognito ? 'Sim' : 'Não'}
              tooltip="Navegação privada/anônima detectada"
              warning={client.isIncognito === true}
            />
            <InfoRow
              label="Automatizado"
              value={client.isAutomated}
              tooltip="Selenium, Puppeteer ou outra automação detectada"
              warning={client.isAutomated}
            />
            <InfoRow
              label="Headless"
              value={client.isHeadless}
              tooltip="Navegador headless detectado"
              warning={client.isHeadless}
            />
            <InfoRow
              label="Máquina Virtual"
              value={client.isVirtualMachine === null ? 'Desconhecido' : client.isVirtualMachine ? 'Sim' : 'Não'}
              tooltip="Executando em uma VM"
            />
            <InfoRow label="Tamanho do Histórico" value={client.historyLength} tooltip="Número de páginas no histórico do navegador" />
          </InfoSection>
        )}

        {/* CSS Preferences */}
        {client && (
          <InfoSection title="Preferências do Sistema" icon="S">
            <InfoRow label="Esquema de Cores" value={client.prefersColorScheme} tooltip="Preferência de modo escuro/claro" />
            <InfoRow label="Movimento Reduzido" value={client.prefersReducedMotion} />
            <InfoRow label="Transparência Reduzida" value={client.prefersReducedTransparency} />
            <InfoRow label="Contraste" value={client.prefersContrast} />
            <InfoRow label="Cores Forçadas" value={client.forcedColors} tooltip="Modo Alto Contraste do Windows" />
            <InfoRow label="Gamut de Cores" value={client.colorGamut} tooltip="Faixa de cores da tela" />
            <InfoRow label="Suporte HDR" value={client.hdrSupported} />
            <InfoRow label="Cores Invertidas" value={client.invertedColors} />
          </InfoSection>
        )}

        {/* Codec Support */}
        {client && (
          <InfoSection title="Codecs de Mídia" icon="V">
            <InfoRow label="Codecs de Vídeo" value={client.videoCodecs.join(', ')} />
            <InfoRow label="Codecs de Áudio" value={client.audioCodecs.join(', ')} />
            <InfoRow label="Widevine DRM" value={client.drmSupported.widevine} />
            <InfoRow label="FairPlay DRM" value={client.drmSupported.fairplay} />
            <InfoRow label="PlayReady DRM" value={client.drmSupported.playready} />
          </InfoSection>
        )}

        {/* Sensors */}
        {client && (
          <InfoSection title="Sensores" icon="G">
            <InfoRow label="Acelerômetro" value={client.sensors.accelerometer} />
            <InfoRow label="Giroscópio" value={client.sensors.gyroscope} />
            <InfoRow label="Magnetômetro" value={client.sensors.magnetometer} />
            <InfoRow label="Luz Ambiente" value={client.sensors.ambientLight} />
            <InfoRow label="Proximidade" value={client.sensors.proximity} />
            <InfoRow label="Aceleração Linear" value={client.sensors.linearAcceleration} />
            <InfoRow label="Gravidade" value={client.sensors.gravity} />
            <InfoRow label="Orientação" value={client.sensors.absoluteOrientation} />
          </InfoSection>
        )}

        {/* Performance Memory */}
        {client?.performanceMemory && (
          <InfoSection title="Memória JS" icon="J">
            <InfoRow label="Limite do Heap" value={formatBytes(client.performanceMemory.jsHeapSizeLimit)} />
            <InfoRow label="Heap Total" value={formatBytes(client.performanceMemory.totalJSHeapSize)} />
            <InfoRow label="Heap Usado" value={formatBytes(client.performanceMemory.usedJSHeapSize)} />
          </InfoSection>
        )}

        {/* Extensions Detected */}
        {client && client.extensionsDetected.length > 0 && (
          <InfoSection title="Extensões Detectadas" icon="E">
            {client.extensionsDetected.map((ext) => (
              <InfoRow key={ext} label={ext} value="Detectado" warning />
            ))}
          </InfoSection>
        )}

        {/* Advanced Capabilities */}
        {client && (
          <InfoSection title="APIs Web" icon="W">
            <InfoRow label="Service Worker" value={client.serviceWorkerSupported} />
            <InfoRow label="Web Worker" value={client.webWorkerSupported} />
            <InfoRow label="WebAssembly" value={client.wasmSupported} />
            <InfoRow label="WebSocket" value={client.webSocketSupported} />
            <InfoRow label="WebRTC" value={client.webRTCSupported} />
            <InfoRow label="Notificações" value={client.notificationSupported} />
            <InfoRow label="Push API" value={client.pushSupported} />
            <InfoRow label="Payment Request" value={client.paymentRequestSupported} />
            <InfoRow label="Credentials API" value={client.credentialsSupported} />
            <InfoRow label="Clipboard API" value={client.clipboardSupported} />
          </InfoSection>
        )}

        {/* Advanced Fingerprints */}
        {client && (
          <InfoSection title="Impressões Digitais Avançadas" icon="F">
            <InfoRow label="Hash Matemático" value={client.mathFingerprint} tooltip="Diferenças matemáticas do motor JS" />
            <InfoRow label="Hash de Timing" value={client.timingFingerprint} tooltip="Impressão digital de performance da CPU" />
            <InfoRow label="Hash de Erro" value={client.errorFingerprint} tooltip="Impressão digital de mensagens de erro" />
            <InfoRow label="Props do Navigator" value={client.navigatorPropsCount} tooltip="Número de propriedades do navigator" />
            <InfoRow label="Props da Janela" value={client.windowPropsCount} tooltip="Número de propriedades da janela" />
            <InfoRow label="Downlink Máximo" value={client.downlinkMax ? `${client.downlinkMax} Mbps` : 'N/A'} />
          </InfoSection>
        )}

        {/* WASM Fingerprint */}
        {client?.wasmFingerprint && (
          <InfoSection title="Impressão Digital WebAssembly" icon="W">
            <InfoRow
              label="Suporte WASM"
              value={client.wasmFingerprint.supported ? 'Suportado' : 'Não Suportado'}
              tooltip="Suporte a WebAssembly neste navegador"
            />
            {client.wasmFingerprint.supported && (
              <>
                <InfoRow
                  label="Recursos"
                  value={[
                    client.wasmFingerprint.features.simd && 'SIMD',
                    client.wasmFingerprint.features.threads && 'Threads',
                    client.wasmFingerprint.features.exceptions && 'Exceptions',
                    client.wasmFingerprint.features.gc && 'GC',
                    client.wasmFingerprint.features.tailCall && 'Tail Call',
                    client.wasmFingerprint.features.relaxedSimd && 'Relaxed SIMD',
                    client.wasmFingerprint.features.referenceTypes && 'Ref Types',
                    client.wasmFingerprint.features.bulkMemory && 'Bulk Memory',
                  ].filter(Boolean).join(', ') || 'Apenas básico'}
                  tooltip="Recursos WASM detectados"
                />
                {client.wasmFingerprint.timing && (
                  <>
                    <InfoRow
                      label="Latência de Chamada"
                      value={`${client.wasmFingerprint.timing.callLatencyMicros.toFixed(2)} us`}
                      tooltip="Latência de chamada JS-para-WASM"
                    />
                    <InfoRow
                      label="Acesso à Memória"
                      value={`${client.wasmFingerprint.timing.memoryAccessMicros.toFixed(2)} us`}
                      tooltip="Timing de acesso à memória WASM"
                    />
                    <InfoRow
                      label="Tempo de Compilação"
                      value={`${client.wasmFingerprint.timing.compilationTimeMs.toFixed(2)} ms`}
                      tooltip="Tempo de compilação do módulo WASM"
                    />
                  </>
                )}
                {client.wasmFingerprint.benchmark && (
                  <>
                    <InfoRow
                      label="Nível da CPU"
                      value={`Nível ${client.wasmFingerprint.benchmark.cpuTier}/5`}
                      tooltip="Nível estimado de performance da CPU"
                      warning={client.wasmFingerprint.benchmark.cpuTier <= 2}
                    />
                    <InfoRow
                      label="Ops Int/ms"
                      value={client.wasmFingerprint.benchmark.intOpsPerMs.toLocaleString()}
                      tooltip="Operações inteiras por milissegundo"
                    />
                    <InfoRow
                      label="Ops Float/ms"
                      value={client.wasmFingerprint.benchmark.floatOpsPerMs.toLocaleString()}
                      tooltip="Operações de ponto flutuante por milissegundo"
                    />
                    <InfoRow
                      label="Taxa de Transferência de Memória"
                      value={`${client.wasmFingerprint.benchmark.memoryThroughputMBps.toFixed(1)} MB/s`}
                      tooltip="Taxa de transferência de memória WASM"
                    />
                  </>
                )}
                {client.wasmFingerprint.memoryLimits && (
                  <InfoRow
                    label="Memória Máxima"
                    value={`${Math.round(client.wasmFingerprint.memoryLimits.maxPages * 64 / 1024)} MB`}
                    tooltip="Alocação máxima de memória WASM"
                  />
                )}
                <InfoRow
                  label="Hash WASM"
                  value={client.wasmFingerprint.fingerprintHash}
                  tooltip="Hash único de impressão digital WASM"
                  warning
                />
                <InfoRow
                  label="Confiança"
                  value={`${client.wasmFingerprint.confidence}%`}
                  tooltip="Pontuação de confiabilidade da impressão digital"
                />
              </>
            )}
          </InfoSection>
        )}

        {/* WebGPU Fingerprint */}
        {client?.webgpuFingerprint && (
          <InfoSection title="Impressão Digital WebGPU" icon="G">
            <InfoRow
              label="WebGPU"
              value={client.webgpuFingerprint.available ? 'Disponível' : 'Não Disponível'}
              tooltip="Disponibilidade da API WebGPU"
            />
            {client.webgpuFingerprint.available && client.webgpuFingerprint.adapterInfo && (
              <>
                <InfoRow
                  label="Fabricante da GPU"
                  value={client.webgpuFingerprint.adapterInfo.vendor}
                  tooltip="Fabricante da GPU do WebGPU"
                />
                <InfoRow
                  label="Arquitetura"
                  value={client.webgpuFingerprint.adapterInfo.architecture}
                  tooltip="Arquitetura da GPU"
                />
                <InfoRow
                  label="Dispositivo"
                  value={client.webgpuFingerprint.adapterInfo.device}
                  tooltip="Identificador do dispositivo GPU"
                />
                {client.webgpuFingerprint.adapterInfo.description && client.webgpuFingerprint.adapterInfo.description !== 'unknown' && (
                  <InfoRow
                    label="Descrição"
                    value={client.webgpuFingerprint.adapterInfo.description.substring(0, 50) + (client.webgpuFingerprint.adapterInfo.description.length > 50 ? '...' : '')}
                    tooltip={client.webgpuFingerprint.adapterInfo.description}
                  />
                )}
                <InfoRow
                  label="Adaptador Fallback"
                  value={client.webgpuFingerprint.adapterInfo.isFallbackAdapter}
                  tooltip="Usando fallback de software"
                  warning={client.webgpuFingerprint.adapterInfo.isFallbackAdapter}
                />
              </>
            )}
            {client.webgpuFingerprint.available && (
              <>
                <InfoRow
                  label="Contagem de Recursos"
                  value={client.webgpuFingerprint.features.length}
                  tooltip="Número de recursos WebGPU suportados"
                />
                {client.webgpuFingerprint.features.length > 0 && (
                  <InfoRow
                    label="Recursos Principais"
                    value={client.webgpuFingerprint.features.slice(0, 5).join(', ') + (client.webgpuFingerprint.features.length > 5 ? '...' : '')}
                    tooltip={client.webgpuFingerprint.features.join(', ')}
                  />
                )}
                {client.webgpuFingerprint.preferredCanvasFormat && (
                  <InfoRow
                    label="Formato Canvas"
                    value={client.webgpuFingerprint.preferredCanvasFormat}
                    tooltip="Formato de canvas preferido para esta GPU"
                  />
                )}
                {client.webgpuFingerprint.computeTimingFingerprint && (
                  <>
                    <InfoRow
                      label="Timing de Computação"
                      value={`${client.webgpuFingerprint.computeTimingFingerprint.avgExecutionTime.toFixed(2)} ms`}
                      tooltip="Tempo médio de execução do compute shader"
                    />
                    <InfoRow
                      label="Padrão de Timing"
                      value={client.webgpuFingerprint.computeTimingFingerprint.patternHash}
                      tooltip="Hash do padrão de agendamento da GPU - único para o modelo da GPU"
                      warning
                    />
                  </>
                )}
                <InfoRow
                  label="Hash WebGPU"
                  value={client.webgpuFingerprint.fingerprintHash}
                  tooltip="Hash único de impressão digital WebGPU"
                  warning
                />
              </>
            )}
          </InfoSection>
        )}

        {/* Chrome AI Status */}
        {client?.chromeAIStatus && (
          <InfoSection title="IA Integrada do Chrome" icon="A">
            <InfoRow
              label="Chrome AI"
              value={client.chromeAIStatus.chromeAISupported ? 'Suportado' : 'Não Suportado'}
              tooltip="IA Gemini Nano integrada do Chrome"
            />
            <InfoRow
              label="Navegador"
              value={client.chromeAIStatus.browser.isChrome ? `Chrome ${client.chromeAIStatus.browser.version}` : 'Não é Chrome'}
              tooltip="Detecção do navegador Chrome"
            />
            <InfoRow
              label="Versão Mínima Atendida"
              value={client.chromeAIStatus.browser.meetsMinimumVersion}
              tooltip="Atende ao requisito Chrome 127+"
            />
            {client.chromeAIStatus.apis.languageModel.supported && (
              <InfoRow
                label="Modelo de Linguagem"
                value={client.chromeAIStatus.apis.languageModel.available === 'readily' ? 'Pronto' :
                       client.chromeAIStatus.apis.languageModel.available === 'after-download' ? 'Precisa Baixar' :
                       client.chromeAIStatus.apis.languageModel.available === 'no' ? 'Indisponível' : 'Não Suportado'}
                tooltip="API do modelo de linguagem Gemini Nano"
                warning={client.chromeAIStatus.apis.languageModel.available === 'readily'}
              />
            )}
            {client.chromeAIStatus.apis.summarizer.supported && (
              <InfoRow
                label="Resumidor"
                value={client.chromeAIStatus.apis.summarizer.available === 'readily' ? 'Pronto' :
                       client.chromeAIStatus.apis.summarizer.available === 'after-download' ? 'Precisa Baixar' :
                       client.chromeAIStatus.apis.summarizer.available === 'no' ? 'Indisponível' : 'Não Suportado'}
                tooltip="API de sumarização por IA"
              />
            )}
            {client.chromeAIStatus.apis.translator.supported && (
              <InfoRow
                label="Tradutor"
                value={client.chromeAIStatus.apis.translator.available === 'readily' ? 'Pronto' :
                       client.chromeAIStatus.apis.translator.available === 'after-download' ? 'Precisa Baixar' :
                       client.chromeAIStatus.apis.translator.available === 'no' ? 'Indisponível' : 'Não Suportado'}
                tooltip="API de tradução por IA"
              />
            )}
            {client.chromeAIStatus.apis.languageDetector.supported && (
              <InfoRow
                label="Detector de Idioma"
                value={client.chromeAIStatus.apis.languageDetector.available === 'readily' ? 'Pronto' :
                       client.chromeAIStatus.apis.languageDetector.available === 'after-download' ? 'Precisa Baixar' :
                       client.chromeAIStatus.apis.languageDetector.available === 'no' ? 'Indisponível' : 'Não Suportado'}
                tooltip="API de detecção de idioma por IA"
              />
            )}
            {!client.chromeAIStatus.apis.languageModel.supported &&
             !client.chromeAIStatus.apis.summarizer.supported &&
             !client.chromeAIStatus.apis.translator.supported &&
             !client.chromeAIStatus.apis.languageDetector.supported && (
              <InfoRow
                label="APIs"
                value="Nenhuma detectada"
                tooltip="Nenhuma API do Chrome AI detectada"
              />
            )}
          </InfoSection>
        )}

        {/* Real-time Behavior Tracking */}
        {client && (
          <InfoSection title="Comportamento do Mouse" icon="M">
            <InfoRow label="Velocidade" value={`${client.behavior.mouseSpeed} px/s`} tooltip="Velocidade média do mouse" />
            <InfoRow label="Aceleração" value={`${client.behavior.mouseAcceleration}`} />
            <InfoRow label="Movimentos" value={client.behavior.mouseMovements} />
            <InfoRow label="Distância" value={`${client.behavior.mouseDistanceTraveled} px`} tooltip="Distância total percorrida" />
            <InfoRow label="Tempo Inativo" value={`${Math.round(client.behavior.mouseIdleTime / 1000)}s`} />
            <InfoRow label="Cliques" value={client.behavior.clickCount} />
            <InfoRow label="Intervalo de Cliques" value={client.behavior.avgClickInterval ? `${client.behavior.avgClickInterval}ms` : 'N/A'} />
          </InfoSection>
        )}

        {client && (
          <InfoSection title="Comportamento de Scroll" icon="S">
            <InfoRow label="Velocidade" value={`${client.behavior.scrollSpeed} px/s`} />
            <InfoRow label="Profundidade Máxima" value={`${Math.round(client.behavior.scrollDepthMax * 100)}%`} tooltip="Posição de scroll mais profunda" />
            <InfoRow label="Mudanças de Direção" value={client.behavior.scrollDirectionChanges} />
            <InfoRow label="Eventos de Scroll" value={client.behavior.scrollEvents} />
          </InfoSection>
        )}

        {client && (
          <InfoSection title="Comportamento de Digitação" icon="K">
            <InfoRow label="Teclas Pressionadas" value={client.behavior.keyPressCount} />
            <InfoRow label="Tempo de Pressionamento" value={client.behavior.avgKeyHoldTime ? `${client.behavior.avgKeyHoldTime}ms` : 'N/A'} tooltip="Duração média de pressionamento da tecla" />
            <InfoRow label="Intervalo entre Teclas" value={client.behavior.avgKeyInterval ? `${client.behavior.avgKeyInterval}ms` : 'N/A'} tooltip="Tempo entre pressionamentos de teclas" />
            <InfoRow label="Velocidade de Digitação" value={`${client.behavior.typingSpeed} CPM`} tooltip="Caracteres por minuto" />
          </InfoSection>
        )}

        {client && (client.behavior.touchCount > 0 || navigator.maxTouchPoints > 0) && (
          <InfoSection title="Comportamento de Toque" icon="T">
            <InfoRow label="Toques" value={client.behavior.touchCount} />
            <InfoRow label="Pressão Média" value={client.behavior.avgTouchPressure || 'N/A'} />
            <InfoRow label="Pinch Zooms" value={client.behavior.pinchZoomCount} />
            <InfoRow label="Deslizamentos" value={client.behavior.swipeCount} />
          </InfoSection>
        )}

        {client && (
          <InfoSection title="Rastreamento de Atenção" icon="!">
            <InfoRow label="Trocas de Aba" value={client.behavior.tabSwitchCount} tooltip="Vezes que você saiu desta aba" warning={client.behavior.tabSwitchCount > 0} />
            <InfoRow label="Tempo Focado" value={formatDuration(client.behavior.totalFocusTime)} tooltip="Tempo gasto com a aba em foco" />
            <InfoRow label="Tempo Ausente" value={formatDuration(client.behavior.totalBlurTime)} tooltip="Tempo gasto em outras abas" />
            <InfoRow label="Duração da Sessão" value={formatDuration(client.behavior.sessionDuration)} />
            <InfoRow label="Primeira Interação" value={client.behavior.firstInteractionTime ? `${Math.round(client.behavior.firstInteractionTime)}ms` : 'N/A'} tooltip="Tempo até a primeira interação mouse/tecla/toque" />
          </InfoSection>
        )}

        {/* Installed Apps */}
        {client && client.installedApps.length > 0 && (
          <InfoSection title="Apps Instalados" icon="A">
            {client.installedApps.map((app) => (
              <InfoRow key={app} label={app} value="Detectado" warning />
            ))}
          </InfoSection>
        )}

        {/* Social Media Logins */}
        {client && (
          <InfoSection title="Logado Em" icon="L">
            <InfoRow
              label="Google"
              value={client.socialLogins.google === null ? 'Desconhecido' : client.socialLogins.google ? 'Logado' : 'Não Logado'}
              warning={client.socialLogins.google === true}
            />
            <InfoRow
              label="Facebook"
              value={client.socialLogins.facebook === null ? 'Desconhecido' : client.socialLogins.facebook ? 'Logado' : 'Não Logado'}
              warning={client.socialLogins.facebook === true}
            />
            <InfoRow
              label="Twitter"
              value={client.socialLogins.twitter === null ? 'Desconhecido' : client.socialLogins.twitter ? 'Logado' : 'Não Logado'}
              warning={client.socialLogins.twitter === true}
            />
            <InfoRow
              label="GitHub"
              value={client.socialLogins.github === null ? 'Desconhecido' : client.socialLogins.github ? 'Logado' : 'Não Logado'}
              warning={client.socialLogins.github === true}
            />
            <InfoRow
              label="Reddit"
              value={client.socialLogins.reddit === null ? 'Desconhecido' : client.socialLogins.reddit ? 'Logado' : 'Não Logado'}
              warning={client.socialLogins.reddit === true}
            />
          </InfoSection>
        )}

        {/* Crypto Wallets */}
        {client && client.cryptoWallets.length > 0 && (
          <InfoSection title="Carteiras Crypto" icon="$">
            {client.cryptoWallets.map((wallet) => (
              <InfoRow key={wallet} label={wallet} value="Conectado" warning />
            ))}
          </InfoSection>
        )}

        {/* VPN Detection */}
        {client && (
          <InfoSection title="Detecção de VPN/Proxy" icon="V">
            <InfoRow
              label="Provavelmente Usando VPN"
              value={client.vpnDetection.likelyUsingVPN}
              warning={client.vpnDetection.likelyUsingVPN}
            />
            <InfoRow
              label="Incompatibilidade de Fuso Horário"
              value={client.vpnDetection.timezoneIPMismatch}
              tooltip="O fuso horário do seu navegador não corresponde à localização do seu IP"
              warning={client.vpnDetection.timezoneIPMismatch}
            />
            <InfoRow
              label="Vazamento WebRTC"
              value={client.vpnDetection.webrtcLeak}
              tooltip="Seu IP real pode estar vazando através do WebRTC"
              warning={client.vpnDetection.webrtcLeak}
            />
          </InfoSection>
        )}

        {/* Advanced Behavior - DevTools & Idle */}
        {client && (
          <InfoSection title="Você Agora" icon="!">
            <InfoRow
              label="DevTools Aberto"
              value={client.advancedBehavior.devToolsOpen}
              tooltip="Podemos detectar se você está inspecionando esta página!"
              warning={client.advancedBehavior.devToolsOpen}
            />
            <InfoRow
              label="Status"
              value={client.advancedBehavior.isIdle ? 'Ausente/Inativo' : 'Ativo'}
              warning={client.advancedBehavior.isIdle}
            />
            <InfoRow
              label="Tempo Inativo"
              value={formatDuration(client.advancedBehavior.idleTime)}
            />
            <InfoRow
              label="Vezes que Ficou AFK"
              value={client.advancedBehavior.afkCount}
            />
            <InfoRow
              label="Mouse na Janela"
              value={!client.advancedBehavior.mouseLeftWindow}
            />
          </InfoSection>
        )}

        {/* Frustration & Engagement */}
        {client && (
          <InfoSection title="Suas Emoções" icon="H">
            <InfoRow
              label="Cliques de Raiva"
              value={client.advancedBehavior.rageClickCount}
              tooltip="Cliques rápidos na mesma área = frustração!"
              warning={client.advancedBehavior.rageClickCount > 0}
            />
            <InfoRow
              label="Intenções de Saída"
              value={client.advancedBehavior.exitIntentCount}
              tooltip="Mouse movido para fechar/sair da página"
            />
            <InfoRow
              label="Engajamento"
              value={`${client.advancedBehavior.contentEngagement}%`}
            />
            <InfoRow
              label="Lateralidade"
              value={`${client.advancedBehavior.likelyHandedness} (${client.advancedBehavior.handednessConfidence}% conf)`}
              tooltip="Podemos adivinhar se você é canhoto ou destro!"
            />
          </InfoSection>
        )}

        {/* Clipboard & Selection */}
        {client && (
          <InfoSection title="Atividade de Copiar/Colar" icon="C">
            <InfoRow label="Seleções de Texto" value={client.advancedBehavior.textSelectCount} />
            <InfoRow
              label="Último Selecionado"
              value={client.advancedBehavior.lastSelectedText || 'Nenhum'}
              tooltip="Podemos ver qual texto você destaca!"
              warning={!!client.advancedBehavior.lastSelectedText}
            />
            <InfoRow label="Cópias" value={client.advancedBehavior.copyCount} />
            <InfoRow label="Colagens" value={client.advancedBehavior.pasteCount} />
            <InfoRow label="Cliques Direitos" value={client.advancedBehavior.rightClickCount} />
            <InfoRow
              label="Tentativas de Screenshot"
              value={client.advancedBehavior.screenshotAttempts}
              warning={client.advancedBehavior.screenshotAttempts > 0}
            />
          </InfoSection>
        )}

        {/* Keyboard Shortcuts Used */}
        {client && client.advancedBehavior.keyboardShortcutsUsed.length > 0 && (
          <InfoSection title="Atalhos Usados" icon="K">
            {client.advancedBehavior.keyboardShortcutsUsed.slice(0, 10).map((shortcut) => (
              <InfoRow key={shortcut} label={shortcut} value="Usado" />
            ))}
          </InfoSection>
        )}

        {/* Privacy Tips */}
        {isCurrentUser && (
          <div className="privacy-tips">
            <h3>Dicas de Privacidade</h3>
            <ul>
              <li>Use uma VPN para mascarar seu endereço IP</li>
              <li>Habilite Não Rastrear no seu navegador</li>
              <li>Use navegadores focados em privacidade como Firefox ou Brave</li>
              <li>Considere usar extensões do navegador para bloquear fingerprinting</li>
              <li>Desabilite WebRTC para prevenir vazamentos de IP local</li>
              <li>Limpe regularmente cookies e dados de navegação</li>
              <li>Use o Tor Browser para máxima anonimidade</li>
              <li>Seus movimentos do mouse, padrões de digitação e comportamento de scroll criam uma impressão digital única!</li>
            </ul>
          </div>
        )}
      </div>

      <div className="info-panel-footer">
        <span className="connected-time">Conectado {formatTimestamp(visitor.connectedAt)}</span>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `há ${hours}h`;
}
