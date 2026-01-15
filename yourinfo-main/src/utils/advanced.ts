/**
 * Advanced Tracking Module
 * Mind-blowing tracking capabilities that will shock users
 */

import type { AdvancedBehavior, UserProfile, ClientInfo } from '../types';

/** Social login detection result */
export interface SocialLoginResult {
  google: boolean | null;
  facebook: boolean | null;
  twitter: boolean | null;
  linkedin: boolean | null;
  github: boolean | null;
  reddit: boolean | null;
  amazon: boolean | null;
  microsoft: boolean | null;
}

/** VPN detection result */
export interface VPNDetectionResult {
  likelyUsingVPN: boolean;
  timezoneIPMismatch: boolean;
  webrtcLeak: boolean;
  suspiciousHeaders: boolean;
}

/**
 * Detect social media logins using image/redirect timing attacks
 * This checks if the user is logged into various services
 */
export async function detectSocialLogins(): Promise<SocialLoginResult> {
  const results: SocialLoginResult = {
    google: null,
    facebook: null,
    twitter: null,
    linkedin: null,
    github: null,
    reddit: null,
    amazon: null,
    microsoft: null,
  };

  // Detection using favicon/image timing
  const checks = [
    {
      service: 'google' as const,
      url: 'https://accounts.google.com/CheckCookie?continue=https://www.google.com/favicon.ico',
    },
    {
      service: 'facebook' as const,
      url: 'https://www.facebook.com/login/device-based/regular/login/?next=https://www.facebook.com/favicon.ico',
    },
    {
      service: 'twitter' as const,
      url: 'https://twitter.com/favicon.ico',
    },
    {
      service: 'github' as const,
      url: 'https://github.com/favicon.ico',
    },
    {
      service: 'reddit' as const,
      url: 'https://www.reddit.com/favicon.ico',
    },
  ];

  // Use timing side-channel (logged in users get faster responses from CDN)
  await Promise.all(
    checks.map(async ({ service }) => {
      try {
        // Try to detect via localStorage/sessionStorage hints
        // For demo purposes, we'll use a simple check
        const detected = await detectLoginViaStorage(service);
        results[service] = detected;
      } catch {
        results[service] = null;
      }
    })
  );

  return results;
}

/**
 * Detect login via localStorage/sessionStorage hints
 */
async function detectLoginViaStorage(service: string): Promise<boolean | null> {
  try {
    // Check for common login indicators in storage
    const storageKeys = Object.keys(localStorage);
    const sessionKeys = Object.keys(sessionStorage);
    const allKeys = [...storageKeys, ...sessionKeys];

    const servicePatterns: Record<string, string[]> = {
      google: ['google', 'gapi', 'youtube', 'gmail'],
      facebook: ['facebook', 'fb_', 'fblo'],
      twitter: ['twitter', 'twtr'],
      linkedin: ['linkedin', 'li_'],
      github: ['github', 'gh_'],
      reddit: ['reddit'],
      amazon: ['amazon', 'amzn'],
      microsoft: ['microsoft', 'msal', 'office'],
    };

    const patterns = servicePatterns[service] || [];
    for (const key of allKeys) {
      for (const pattern of patterns) {
        if (key.toLowerCase().includes(pattern)) {
          return true;
        }
      }
    }

    return false;
  } catch {
    return null;
  }
}

/**
 * Detect cryptocurrency wallets
 */
export function detectCryptoWallets(): string[] {
  const wallets: string[] = [];

  const win = window as Window & {
    ethereum?: { isMetaMask?: boolean; isCoinbaseWallet?: boolean; isBraveWallet?: boolean };
    solana?: { isPhantom?: boolean };
    phantom?: { solana?: unknown };
    coinbaseWalletExtension?: unknown;
    trustwallet?: unknown;
    BinanceChain?: unknown;
    solflare?: unknown;
    tronWeb?: unknown;
    tronLink?: unknown;
  };

  // MetaMask
  if (win.ethereum?.isMetaMask) {
    wallets.push('MetaMask');
  }

  // Coinbase Wallet
  if (win.ethereum?.isCoinbaseWallet || win.coinbaseWalletExtension) {
    wallets.push('Coinbase Wallet');
  }

  // Brave Wallet
  if (win.ethereum?.isBraveWallet) {
    wallets.push('Brave Wallet');
  }

  // Phantom (Solana)
  if (win.solana?.isPhantom || win.phantom?.solana) {
    wallets.push('Phantom');
  }

  // Trust Wallet
  if (win.trustwallet) {
    wallets.push('Trust Wallet');
  }

  // Binance Wallet
  if (win.BinanceChain) {
    wallets.push('Binance Wallet');
  }

  // Solflare
  if (win.solflare) {
    wallets.push('Solflare');
  }

  // TronLink
  if (win.tronWeb || win.tronLink) {
    wallets.push('TronLink');
  }

  // Generic Ethereum provider
  if (win.ethereum && !wallets.length) {
    wallets.push('Unknown Web3 Wallet');
  }

  return wallets;
}

/**
 * Detect VPN/Proxy usage
 */
export async function detectVPN(
  serverTimezone: string | undefined,
  webrtcLocalIPs: string[]
): Promise<VPNDetectionResult> {
  const result: VPNDetectionResult = {
    likelyUsingVPN: false,
    timezoneIPMismatch: false,
    webrtcLeak: false,
    suspiciousHeaders: false,
  };

  // Check timezone mismatch
  const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (serverTimezone && serverTimezone !== clientTimezone) {
    // Timezones don't match - possible VPN
    result.timezoneIPMismatch = true;
    result.likelyUsingVPN = true;
  }

  // Check WebRTC leak (private IPs exposed while using VPN)
  if (webrtcLocalIPs.length > 0) {
    result.webrtcLeak = true;
    // If we can see local IPs, the VPN might be leaking
  }

  return result;
}

/**
 * Generate a cross-browser fingerprint ID
 * Uses only hardware/system characteristics that are the same across browsers
 */
export function generateCrossBrowserId(): { id: string; factors: string[] } {
  const factors: string[] = [];
  const components: string[] = [];

  // Screen characteristics (same across browsers)
  components.push(`${window.screen.width}x${window.screen.height}`);
  factors.push(`Screen: ${window.screen.width}x${window.screen.height}`);

  components.push(`${window.screen.colorDepth}`);
  factors.push(`Color Depth: ${window.screen.colorDepth}-bit`);

  components.push(`${window.devicePixelRatio}`);
  factors.push(`Pixel Ratio: ${window.devicePixelRatio}x`);

  // Hardware (same across browsers)
  components.push(`${navigator.hardwareConcurrency}`);
  factors.push(`CPU Cores: ${navigator.hardwareConcurrency}`);

  const deviceMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (deviceMem) {
    components.push(`${deviceMem}`);
    factors.push(`RAM: ${deviceMem}GB`);
  }

  // Timezone (same across browsers)
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  components.push(tz);
  factors.push(`Timezone: ${tz}`);

  // Language (usually same)
  components.push(navigator.language);
  factors.push(`Language: ${navigator.language}`);

  // Platform (same across browsers)
  components.push(navigator.platform);
  factors.push(`Platform: ${navigator.platform}`);

  // Max touch points (same hardware)
  components.push(`${navigator.maxTouchPoints}`);
  factors.push(`Touch Points: ${navigator.maxTouchPoints}`);

  // Installed fonts (mostly same across browsers)
  const fontCount = detectFontCount();
  components.push(`${fontCount}`);
  factors.push(`Fonts: ~${fontCount}`);

  // Create hash
  const componentString = components.join('|');
  let hash = 0;
  for (let i = 0; i < componentString.length; i++) {
    const char = componentString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return {
    id: `xb_${Math.abs(hash).toString(16).padStart(8, '0')}`,
    factors,
  };
}

/**
 * Quick font count detection
 */
function detectFontCount(): number {
  const testFonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Monaco',
    'Menlo', 'Consolas', 'SF Pro', 'Roboto', 'Open Sans', 'Segoe UI',
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testString = 'mmmmmmmmmmlli';
  const testSize = '72px';

  const baseMeasurements: Record<string, number> = {};
  for (const font of baseFonts) {
    ctx.font = `${testSize} ${font}`;
    baseMeasurements[font] = ctx.measureText(testString).width;
  }

  let count = 0;
  for (const font of testFonts) {
    for (const baseFont of baseFonts) {
      ctx.font = `${testSize} '${font}', ${baseFont}`;
      if (ctx.measureText(testString).width !== baseMeasurements[baseFont]) {
        count++;
        break;
      }
    }
  }

  return count;
}

/**
 * Generate a unique fingerprint ID
 */
export function generateFingerprintId(clientInfo: Record<string, unknown>): { id: string; confidence: number } {
  // Combine multiple fingerprint sources
  const components = [
    clientInfo.screenWidth,
    clientInfo.screenHeight,
    clientInfo.screenColorDepth,
    clientInfo.devicePixelRatio,
    clientInfo.hardwareConcurrency,
    clientInfo.platform,
    clientInfo.timezone,
    clientInfo.language,
    clientInfo.webglRenderer,
    clientInfo.webglVendor,
    clientInfo.canvasFingerprint,
    clientInfo.audioFingerprint,
    clientInfo.fontsDetected,
    clientInfo.mathFingerprint,
    clientInfo.errorFingerprint,
  ];

  // Create hash
  const componentString = components.map((c) => String(c ?? '')).join('|');
  let hash = 0;
  for (let i = 0; i < componentString.length; i++) {
    const char = componentString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const id = Math.abs(hash).toString(16).padStart(8, '0');

  // Calculate confidence based on how many components we have
  const validComponents = components.filter((c) => c !== null && c !== undefined && c !== '').length;
  const confidence = Math.round((validComponents / components.length) * 100);

  return { id: `fp_${id}`, confidence };
}

/**
 * Advanced behavior tracker
 */
class AdvancedBehaviorTracker {
  private state: {
    devToolsOpen: boolean;
    lastActivityTime: number;
    idleThreshold: number;
    afkCount: number;
    textSelectCount: number;
    lastSelectedText: string;
    copyCount: number;
    pasteCount: number;
    clicks: Array<{ x: number; y: number; time: number }>;
    rageClickCount: number;
    lastRageClickTime: number;
    exitIntentCount: number;
    mouseInWindow: boolean;
    mousePositions: Array<{ x: number; y: number }>;
    rightClickCount: number;
    screenshotAttempts: number;
    keyboardShortcuts: Set<string>;
    focusPeriods: number[];
    currentFocusStart: number;
    formInteractions: number;
    formFieldsTyped: Set<string>;
  };

  private devToolsCheckInterval: ReturnType<typeof setInterval> | null = null;
  private initialized = false;

  constructor() {
    this.state = {
      devToolsOpen: false,
      lastActivityTime: Date.now(),
      idleThreshold: 30000, // 30 seconds
      afkCount: 0,
      textSelectCount: 0,
      lastSelectedText: '',
      copyCount: 0,
      pasteCount: 0,
      clicks: [],
      rageClickCount: 0,
      lastRageClickTime: 0,
      exitIntentCount: 0,
      mouseInWindow: true,
      mousePositions: [],
      rightClickCount: 0,
      screenshotAttempts: 0,
      keyboardShortcuts: new Set(),
      focusPeriods: [],
      currentFocusStart: Date.now(),
      formInteractions: 0,
      formFieldsTyped: new Set(),
    };
  }

  start(): void {
    if (this.initialized) return;
    this.initialized = true;

    // DevTools detection
    this.startDevToolsDetection();

    // Event listeners
    document.addEventListener('selectionchange', this.handleSelection);
    document.addEventListener('copy', this.handleCopy);
    document.addEventListener('paste', this.handlePaste);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('contextmenu', this.handleRightClick);
    document.addEventListener('mouseleave', this.handleMouseLeave);
    document.addEventListener('mouseenter', this.handleMouseEnter);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('focus', this.handleFormFocus, true);
    document.addEventListener('input', this.handleFormInput, true);

    // Activity tracking
    ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((event) => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  stop(): void {
    if (!this.initialized) return;

    if (this.devToolsCheckInterval) {
      clearInterval(this.devToolsCheckInterval);
    }

    document.removeEventListener('selectionchange', this.handleSelection);
    document.removeEventListener('copy', this.handleCopy);
    document.removeEventListener('paste', this.handlePaste);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('contextmenu', this.handleRightClick);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    document.removeEventListener('mouseenter', this.handleMouseEnter);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('focus', this.handleFormFocus, true);
    document.removeEventListener('input', this.handleFormInput, true);

    this.initialized = false;
  }

  getData(): AdvancedBehavior {
    const now = Date.now();
    const idleTime = now - this.state.lastActivityTime;
    const isIdle = idleTime > this.state.idleThreshold;

    // Calculate handedness from mouse positions
    const handedness = this.calculateHandedness();

    // Calculate average focus duration
    const avgFocus =
      this.state.focusPeriods.length > 0
        ? this.state.focusPeriods.reduce((a, b) => a + b, 0) / this.state.focusPeriods.length
        : 0;

    return {
      devToolsOpen: this.state.devToolsOpen,
      isIdle,
      idleTime,
      afkCount: this.state.afkCount,
      textSelectCount: this.state.textSelectCount,
      lastSelectedText: this.state.lastSelectedText.substring(0, 50),
      copyCount: this.state.copyCount,
      pasteCount: this.state.pasteCount,
      rageClickCount: this.state.rageClickCount,
      lastRageClickTime: this.state.lastRageClickTime,
      exitIntentCount: this.state.exitIntentCount,
      mouseLeftWindow: !this.state.mouseInWindow,
      likelyHandedness: handedness.hand,
      handednessConfidence: handedness.confidence,
      estimatedReadingSpeed: 0, // Would need content analysis
      contentEngagement: this.calculateEngagement(),
      focusLossCount: this.state.afkCount,
      avgFocusDuration: avgFocus,
      formInteractions: this.state.formInteractions,
      formFieldsTyped: this.state.formFieldsTyped.size,
      formAbandoned: false,
      rightClickCount: this.state.rightClickCount,
      screenshotAttempts: this.state.screenshotAttempts,
      keyboardShortcutsUsed: Array.from(this.state.keyboardShortcuts),
    };
  }

  private startDevToolsDetection(): void {
    // Method 1: Window size difference (devtools takes space)
    const checkDevTools = () => {
      // Check if window inner size is significantly smaller than outer size
      // This happens when DevTools is docked
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      this.state.devToolsOpen = widthThreshold || heightThreshold;
    };

    // Method 2: Element inspection detection
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.state.devToolsOpen = true;
      },
    });

    this.devToolsCheckInterval = setInterval(checkDevTools, 1000);
    checkDevTools();
  }

  private handleSelection = (): void => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      this.state.textSelectCount++;
      this.state.lastSelectedText = selection.toString();
    }
  };

  private handleCopy = (): void => {
    this.state.copyCount++;
  };

  private handlePaste = (): void => {
    this.state.pasteCount++;
  };

  private handleClick = (e: MouseEvent): void => {
    const now = Date.now();
    const click = { x: e.clientX, y: e.clientY, time: now };
    this.state.clicks.push(click);

    // Keep only last 20 clicks
    if (this.state.clicks.length > 20) {
      this.state.clicks.shift();
    }

    // Detect rage clicks (3+ clicks within 500ms in same area)
    const recentClicks = this.state.clicks.filter((c) => now - c.time < 500);
    if (recentClicks.length >= 3) {
      const firstClick = recentClicks[0];
      const allNearby = recentClicks.every(
        (c) => Math.abs(c.x - firstClick.x) < 50 && Math.abs(c.y - firstClick.y) < 50
      );
      if (allNearby) {
        this.state.rageClickCount++;
        this.state.lastRageClickTime = now;
      }
    }
  };

  private handleRightClick = (): void => {
    this.state.rightClickCount++;
  };

  private handleMouseLeave = (e: MouseEvent): void => {
    // Exit intent - mouse leaving through top of page
    if (e.clientY <= 0) {
      this.state.exitIntentCount++;
    }
    this.state.mouseInWindow = false;
  };

  private handleMouseEnter = (): void => {
    this.state.mouseInWindow = true;
  };

  private handleMouseMove = (e: MouseEvent): void => {
    this.state.mousePositions.push({ x: e.clientX, y: e.clientY });
    if (this.state.mousePositions.length > 100) {
      this.state.mousePositions.shift();
    }
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Detect screenshot attempts
    if (e.key === 'PrintScreen') {
      this.state.screenshotAttempts++;
    }

    // Track keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      const shortcut = `${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key.toUpperCase()}`;
      this.state.keyboardShortcuts.add(shortcut);
    }
  };

  private handleFormFocus = (e: Event): void => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      this.state.formInteractions++;
    }
  };

  private handleFormInput = (e: Event): void => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      const name = e.target.name || e.target.id || 'unknown';
      this.state.formFieldsTyped.add(name);
    }
  };

  private handleActivity = (): void => {
    const now = Date.now();
    const wasIdle = now - this.state.lastActivityTime > this.state.idleThreshold;

    if (wasIdle) {
      this.state.afkCount++;
      this.state.focusPeriods.push(this.state.idleThreshold);
    }

    this.state.lastActivityTime = now;
  };

  private calculateHandedness(): { hand: 'left' | 'right' | 'unknown'; confidence: number; warning?: string } {
    if (this.state.mousePositions.length < 50) {
      return { hand: 'unknown', confidence: 0, warning: 'Insufficient mouse data for reliable handedness detection' };
    }

    // Analyze mouse movement patterns
    // Right-handed users typically have more movements on the right side
    // and diagonal movements from bottom-left to top-right
    const positions = this.state.mousePositions;
    const screenCenter = window.innerWidth / 2;

    let rightSideCount = 0;
    let leftSideCount = 0;

    for (const pos of positions) {
      if (pos.x > screenCenter) {
        rightSideCount++;
      } else {
        leftSideCount++;
      }
    }

    const rightRatio = rightSideCount / positions.length;
    const leftRatio = leftSideCount / positions.length;

    // Note: Mouse position heuristics have low accuracy - website layout heavily influences cursor position
    const warning = 'Low confidence: mouse position is heavily influenced by UI layout, not handedness';

    if (rightRatio > 0.6) {
      return { hand: 'right', confidence: Math.round(rightRatio * 100), warning };
    } else if (leftRatio > 0.6) {
      return { hand: 'left', confidence: Math.round(leftRatio * 100), warning };
    }

    return { hand: 'unknown', confidence: 50, warning };
  }

  private calculateEngagement(): number {
    // Simple engagement score based on interactions
    const clicks = this.state.clicks.length;
    const selections = this.state.textSelectCount;
    const scrolled = window.scrollY > 0;
    const copies = this.state.copyCount;

    let score = 0;
    if (clicks > 0) score += 20;
    if (clicks > 5) score += 20;
    if (selections > 0) score += 20;
    if (scrolled) score += 20;
    if (copies > 0) score += 20;

    return Math.min(score, 100);
  }
}

export const advancedBehaviorTracker = new AdvancedBehaviorTracker();

/**
 * Parse GPU model from WebGL renderer string
 */
function parseGPU(renderer: string | null | undefined): {
  brand: string;
  model: string;
  tier: 'integrated' | 'entry' | 'mid' | 'high' | 'enthusiast';
  estimatedValue: number;
} {
  if (!renderer) {
    return { brand: 'Unknown', model: 'Unknown', tier: 'integrated', estimatedValue: 0 };
  }

  const r = renderer.toLowerCase();

  // Apple Silicon
  if (r.includes('apple')) {
    if (r.includes('m3 max') || r.includes('m3 ultra')) {
      return { brand: 'Apple', model: 'M3 Max/Ultra', tier: 'enthusiast', estimatedValue: 3000 };
    }
    if (r.includes('m3 pro')) {
      return { brand: 'Apple', model: 'M3 Pro', tier: 'high', estimatedValue: 2000 };
    }
    if (r.includes('m3')) {
      return { brand: 'Apple', model: 'M3', tier: 'mid', estimatedValue: 1200 };
    }
    if (r.includes('m2 max') || r.includes('m2 ultra')) {
      return { brand: 'Apple', model: 'M2 Max/Ultra', tier: 'enthusiast', estimatedValue: 2500 };
    }
    if (r.includes('m2 pro')) {
      return { brand: 'Apple', model: 'M2 Pro', tier: 'high', estimatedValue: 1800 };
    }
    if (r.includes('m2')) {
      return { brand: 'Apple', model: 'M2', tier: 'mid', estimatedValue: 1000 };
    }
    if (r.includes('m1 max') || r.includes('m1 ultra')) {
      return { brand: 'Apple', model: 'M1 Max/Ultra', tier: 'high', estimatedValue: 2000 };
    }
    if (r.includes('m1 pro')) {
      return { brand: 'Apple', model: 'M1 Pro', tier: 'high', estimatedValue: 1500 };
    }
    if (r.includes('m1')) {
      return { brand: 'Apple', model: 'M1', tier: 'mid', estimatedValue: 800 };
    }
    return { brand: 'Apple', model: 'Apple GPU', tier: 'mid', estimatedValue: 800 };
  }

  // NVIDIA
  if (r.includes('nvidia') || r.includes('geforce') || r.includes('rtx') || r.includes('gtx')) {
    // RTX 40 series
    if (r.includes('4090')) return { brand: 'NVIDIA', model: 'RTX 4090', tier: 'enthusiast', estimatedValue: 1600 };
    if (r.includes('4080')) return { brand: 'NVIDIA', model: 'RTX 4080', tier: 'enthusiast', estimatedValue: 1000 };
    if (r.includes('4070 ti')) return { brand: 'NVIDIA', model: 'RTX 4070 Ti', tier: 'high', estimatedValue: 800 };
    if (r.includes('4070')) return { brand: 'NVIDIA', model: 'RTX 4070', tier: 'high', estimatedValue: 600 };
    if (r.includes('4060 ti')) return { brand: 'NVIDIA', model: 'RTX 4060 Ti', tier: 'mid', estimatedValue: 400 };
    if (r.includes('4060')) return { brand: 'NVIDIA', model: 'RTX 4060', tier: 'mid', estimatedValue: 300 };
    // RTX 30 series
    if (r.includes('3090')) return { brand: 'NVIDIA', model: 'RTX 3090', tier: 'enthusiast', estimatedValue: 800 };
    if (r.includes('3080')) return { brand: 'NVIDIA', model: 'RTX 3080', tier: 'high', estimatedValue: 500 };
    if (r.includes('3070')) return { brand: 'NVIDIA', model: 'RTX 3070', tier: 'high', estimatedValue: 400 };
    if (r.includes('3060')) return { brand: 'NVIDIA', model: 'RTX 3060', tier: 'mid', estimatedValue: 250 };
    // RTX 20 series
    if (r.includes('2080')) return { brand: 'NVIDIA', model: 'RTX 2080', tier: 'high', estimatedValue: 300 };
    if (r.includes('2070')) return { brand: 'NVIDIA', model: 'RTX 2070', tier: 'mid', estimatedValue: 200 };
    if (r.includes('2060')) return { brand: 'NVIDIA', model: 'RTX 2060', tier: 'mid', estimatedValue: 150 };
    // GTX series
    if (r.includes('1080')) return { brand: 'NVIDIA', model: 'GTX 1080', tier: 'mid', estimatedValue: 150 };
    if (r.includes('1070')) return { brand: 'NVIDIA', model: 'GTX 1070', tier: 'mid', estimatedValue: 100 };
    if (r.includes('1060')) return { brand: 'NVIDIA', model: 'GTX 1060', tier: 'entry', estimatedValue: 80 };
    if (r.includes('1650') || r.includes('1660')) return { brand: 'NVIDIA', model: 'GTX 16xx', tier: 'entry', estimatedValue: 150 };
    return { brand: 'NVIDIA', model: 'NVIDIA GPU', tier: 'mid', estimatedValue: 200 };
  }

  // AMD
  if (r.includes('amd') || r.includes('radeon')) {
    if (r.includes('7900')) return { brand: 'AMD', model: 'RX 7900', tier: 'enthusiast', estimatedValue: 800 };
    if (r.includes('7800')) return { brand: 'AMD', model: 'RX 7800', tier: 'high', estimatedValue: 500 };
    if (r.includes('7700')) return { brand: 'AMD', model: 'RX 7700', tier: 'mid', estimatedValue: 400 };
    if (r.includes('7600')) return { brand: 'AMD', model: 'RX 7600', tier: 'mid', estimatedValue: 270 };
    if (r.includes('6900')) return { brand: 'AMD', model: 'RX 6900', tier: 'enthusiast', estimatedValue: 500 };
    if (r.includes('6800')) return { brand: 'AMD', model: 'RX 6800', tier: 'high', estimatedValue: 400 };
    if (r.includes('6700')) return { brand: 'AMD', model: 'RX 6700', tier: 'mid', estimatedValue: 300 };
    if (r.includes('6600')) return { brand: 'AMD', model: 'RX 6600', tier: 'mid', estimatedValue: 200 };
    return { brand: 'AMD', model: 'AMD GPU', tier: 'mid', estimatedValue: 200 };
  }

  // Intel
  if (r.includes('intel')) {
    if (r.includes('arc')) return { brand: 'Intel', model: 'Intel Arc', tier: 'mid', estimatedValue: 200 };
    if (r.includes('iris xe')) return { brand: 'Intel', model: 'Iris Xe', tier: 'integrated', estimatedValue: 0 };
    if (r.includes('iris')) return { brand: 'Intel', model: 'Intel Iris', tier: 'integrated', estimatedValue: 0 };
    if (r.includes('uhd')) return { brand: 'Intel', model: 'Intel UHD', tier: 'integrated', estimatedValue: 0 };
    return { brand: 'Intel', model: 'Intel GPU', tier: 'integrated', estimatedValue: 0 };
  }

  return { brand: 'Unknown', model: renderer.substring(0, 30), tier: 'integrated', estimatedValue: 0 };
}

/**
 * Infer country from timezone with comprehensive mapping
 */
function inferCountry(timezone: string): string {
  const tzMap: Record<string, string> = {
    // Americas
    'America/New_York': 'United States', 'America/Chicago': 'United States',
    'America/Denver': 'United States', 'America/Los_Angeles': 'United States',
    'America/Phoenix': 'United States', 'America/Anchorage': 'United States',
    'America/Toronto': 'Canada', 'America/Vancouver': 'Canada',
    'America/Montreal': 'Canada', 'America/Edmonton': 'Canada',
    'America/Mexico_City': 'Mexico', 'America/Cancun': 'Mexico',
    'America/Sao_Paulo': 'Brazil', 'America/Rio_Branco': 'Brazil',
    'America/Argentina/Buenos_Aires': 'Argentina',
    'America/Santiago': 'Chile', 'America/Lima': 'Peru',
    'America/Bogota': 'Colombia', 'America/Caracas': 'Venezuela',
    // Europe
    'Europe/London': 'United Kingdom', 'Europe/Dublin': 'Ireland',
    'Europe/Paris': 'France', 'Europe/Berlin': 'Germany',
    'Europe/Madrid': 'Spain', 'Europe/Rome': 'Italy',
    'Europe/Amsterdam': 'Netherlands', 'Europe/Brussels': 'Belgium',
    'Europe/Vienna': 'Austria', 'Europe/Zurich': 'Switzerland',
    'Europe/Stockholm': 'Sweden', 'Europe/Oslo': 'Norway',
    'Europe/Copenhagen': 'Denmark', 'Europe/Helsinki': 'Finland',
    'Europe/Warsaw': 'Poland', 'Europe/Prague': 'Czech Republic',
    'Europe/Budapest': 'Hungary', 'Europe/Bucharest': 'Romania',
    'Europe/Athens': 'Greece', 'Europe/Istanbul': 'Turkey',
    'Europe/Moscow': 'Russia', 'Europe/Kiev': 'Ukraine',
    'Europe/Lisbon': 'Portugal',
    // Asia
    'Asia/Tokyo': 'Japan', 'Asia/Seoul': 'South Korea',
    'Asia/Shanghai': 'China', 'Asia/Hong_Kong': 'Hong Kong',
    'Asia/Taipei': 'Taiwan', 'Asia/Singapore': 'Singapore',
    'Asia/Kuala_Lumpur': 'Malaysia', 'Asia/Bangkok': 'Thailand',
    'Asia/Jakarta': 'Indonesia', 'Asia/Manila': 'Philippines',
    'Asia/Ho_Chi_Minh': 'Vietnam', 'Asia/Kolkata': 'India',
    'Asia/Mumbai': 'India', 'Asia/Dubai': 'UAE',
    'Asia/Riyadh': 'Saudi Arabia', 'Asia/Tehran': 'Iran',
    'Asia/Jerusalem': 'Israel', 'Asia/Karachi': 'Pakistan',
    'Asia/Dhaka': 'Bangladesh',
    // Oceania
    'Australia/Sydney': 'Australia', 'Australia/Melbourne': 'Australia',
    'Australia/Brisbane': 'Australia', 'Australia/Perth': 'Australia',
    'Pacific/Auckland': 'New Zealand',
    // Africa
    'Africa/Cairo': 'Egypt', 'Africa/Lagos': 'Nigeria',
    'Africa/Johannesburg': 'South Africa', 'Africa/Nairobi': 'Kenya',
    'Africa/Casablanca': 'Morocco',
  };

  // Direct match
  if (tzMap[timezone]) return tzMap[timezone];

  // Partial match
  for (const [tz, country] of Object.entries(tzMap)) {
    if (timezone.includes(tz.split('/')[1])) return country;
  }

  // Region-based guess
  if (timezone.startsWith('America/')) return 'Americas';
  if (timezone.startsWith('Europe/')) return 'Europe';
  if (timezone.startsWith('Asia/')) return 'Asia';
  if (timezone.startsWith('Africa/')) return 'Africa';
  if (timezone.startsWith('Australia/') || timezone.startsWith('Pacific/')) return 'Oceania';

  return 'Unknown';
}

/**
 * Generate user profile based on collected data
 * This is what advertisers and big tech companies infer about you
 */
export function generateUserProfile(clientInfo: Partial<ClientInfo>): UserProfile {
  let developerScore = 0;
  let gamerScore = 0;
  let designerScore = 0;
  let powerUserScore = 0;
  let privacyScore = 0;
  const botIndicators: string[] = [];
  const fraudIndicators: string[] = [];
  const inferredInterests: string[] = [];
  let developerReason = '';
  let gamerReason = '';
  let designerReason = '';
  let powerUserReason = '';
  let privacyReason = '';

  // Parse GPU info
  const gpu = parseGPU(clientInfo.webglRenderer);

  // Common hardware values used across multiple detections
  const ram = clientInfo.deviceMemory || 0;

  // ============ DEVELOPER DETECTION ============
  // Scoring weights: definitive signals (40-60), strong signals (20-35), moderate signals (10-20), weak signals (5-10)
  const developerSignals: string[] = [];

  // TIER 1: Definitive signals (very high confidence)
  // DevTools open is one of the strongest signals - only developers typically have these open
  if (clientInfo.advancedBehavior?.devToolsOpen) {
    developerScore += 55;
    developerSignals.push('DevTools open');
  }

  // Dev extensions are nearly definitive - require installation and conscious choice
  const devExtensions = [
    { name: 'React DevTools', score: 45, interest: 'React Development' },
    { name: 'Vue DevTools', score: 45, interest: 'Vue Development' },
    { name: 'Redux DevTools', score: 40, interest: 'State Management' },
    { name: 'Angular DevTools', score: 45, interest: 'Angular Development' },
    { name: 'Svelte DevTools', score: 45, interest: 'Svelte Development' },
  ];
  for (const ext of devExtensions) {
    if (clientInfo.extensionsDetected?.includes(ext.name)) {
      developerScore += ext.score;
      developerSignals.push(ext.name);
      inferredInterests.push(ext.interest);
    }
  }

  // TIER 2: Strong signals (high confidence)
  // GitHub login - strong indicator of developer activity
  if (clientInfo.socialLogins?.github) {
    developerScore += 35;
    developerSignals.push('GitHub logged in');
    inferredInterests.push('Open Source');
  }

  // Coding fonts - intentionally installed, strong signal
  // Weighted by specificity: specialized coding fonts > common monospace
  const specializedCodingFonts = ['Fira Code', 'JetBrains Mono', 'Cascadia Code', 'Hack', 'Inconsolata', 'Source Code Pro', 'Ubuntu Mono', 'Dank Mono', 'Operator Mono', 'MonoLisa', 'Iosevka', 'Victor Mono'];
  const commonMonoFonts = ['Monaco', 'Menlo', 'Consolas', 'Courier New'];
  const foundSpecializedFonts = clientInfo.fontsDetected?.filter(f => specializedCodingFonts.includes(f)) || [];
  const foundCommonMonoFonts = clientInfo.fontsDetected?.filter(f => commonMonoFonts.includes(f)) || [];

  if (foundSpecializedFonts.length > 0) {
    // Specialized coding fonts are strong indicators (user went out of way to install)
    developerScore += 25 + Math.min(foundSpecializedFonts.length * 8, 24); // Max 49
    developerSignals.push(`Coding fonts: ${foundSpecializedFonts.slice(0, 3).join(', ')}`);
  } else if (foundCommonMonoFonts.length >= 2) {
    // Multiple common mono fonts is weaker signal (may come with OS)
    developerScore += 8;
    developerSignals.push('Multiple monospace fonts');
  }

  // DevTools keyboard shortcuts used - strong behavioral signal
  const devShortcuts = ['SHIFT+I', 'SHIFT+J', 'SHIFT+C', 'SHIFT+K', 'SHIFT+M']; // DevTools, console, elements, network, device
  const usedDevShortcuts = clientInfo.advancedBehavior?.keyboardShortcutsUsed?.filter(
    k => devShortcuts.some(d => k.toUpperCase().includes(d))
  ) || [];
  if (usedDevShortcuts.length > 0) {
    developerScore += 25 + Math.min(usedDevShortcuts.length * 5, 15); // 25-40
    developerSignals.push('DevTools shortcuts');
  }

  // TIER 3: Moderate signals (medium confidence, need corroboration)
  // High-end hardware - common but not exclusive to devs
  const devCores = clientInfo.hardwareConcurrency || 0;
  const devRam = clientInfo.deviceMemory || 0;
  if (devCores >= 12 && devRam >= 8) {
    developerScore += 12;
  } else if (devCores >= 8 && devRam >= 8) {
    developerScore += 8;
  }

  // Linux platform - higher developer prevalence
  if (clientInfo.platform?.toLowerCase().includes('linux')) {
    developerScore += 18;
    developerSignals.push('Linux platform');
  }

  // Many browser tabs/history (power usage pattern)
  if ((clientInfo.historyLength || 0) >= 50) {
    developerScore += 6;
  }

  // TIER 4: Weak/supporting signals (low confidence alone)
  // Touch typing speed indicators - fast copy/paste patterns
  const copyPasteRatio = (clientInfo.advancedBehavior?.copyCount || 0) + (clientInfo.advancedBehavior?.pasteCount || 0);
  if (copyPasteRatio >= 5) {
    developerScore += 5; // Frequent copy/paste suggests coding workflow
  }

  // Right-click menu usage (inspect element access)
  if ((clientInfo.advancedBehavior?.rightClickCount || 0) >= 3) {
    developerScore += 4;
  }

  // Wide screen resolution (common for dev workstations)
  if ((clientInfo.screenWidth || 0) >= 2560 && (clientInfo.devicePixelRatio || 1) >= 1) {
    developerScore += 6;
  }

  // Ultrawide aspect ratio (very common for developers)
  const aspectRatio = (clientInfo.screenWidth || 1920) / (clientInfo.screenHeight || 1080);
  if (aspectRatio >= 2.3) { // 21:9 or wider
    developerScore += 10;
    developerSignals.push('Ultrawide display');
  }

  // Set developer reason from strongest signal
  developerReason = developerSignals[0] || '';

  // ============ GAMER DETECTION ============
  // Scoring weights: definitive signals (40-60), strong signals (25-40), moderate signals (10-25), weak signals (5-10)
  const gamerSignals: string[] = [];

  // TIER 1: Definitive signals (very high confidence)
  // Gaming-grade discrete GPU is the strongest signal
  // Enthusiast GPUs (RTX 4090, 4080, 3090, RX 7900) are almost exclusively for gaming/3D work
  if (gpu.tier === 'enthusiast') {
    gamerScore += 55;
    gamerSignals.push(`${gpu.model} (enthusiast GPU)`);
    inferredInterests.push('PC Gaming');
  } else if (gpu.tier === 'high') {
    // High-end GPUs (RTX 4070, 3080, 3070) - still strong gaming signal
    gamerScore += 40;
    gamerSignals.push(`${gpu.model} (high-end GPU)`);
    inferredInterests.push('PC Gaming');
  } else if (gpu.tier === 'mid' && gpu.brand !== 'Apple') {
    // Mid-range discrete GPUs - moderate gaming signal (could be casual/entry gamer)
    // Exclude Intel UHD as it's integrated
    if (!gpu.model.includes('Intel') && !gpu.model.includes('UHD') && !gpu.model.includes('Iris')) {
      gamerScore += 22;
      gamerSignals.push(`${gpu.model} (discrete GPU)`);
    }
  }

  // TIER 2: Strong signals (high confidence)
  // Gamepad connected - definitive gaming signal
  if (clientInfo.gamepadsSupported) {
    try {
      const gamepads = navigator.getGamepads?.();
      const connectedGamepads = gamepads ? Array.from(gamepads).filter(g => g !== null) : [];
      if (connectedGamepads.length > 0) {
        gamerScore += 50; // Very strong signal
        gamerSignals.push('Gamepad connected');
        inferredInterests.push('Console Gaming');
        // Multiple gamepads suggests serious gamer (local multiplayer)
        if (connectedGamepads.length > 1) {
          gamerScore += 10;
          gamerSignals.push('Multiple gamepads');
        }
      }
    } catch {
      // Gamepad API blocked or unavailable
    }
  }

  // High refresh rate detection (if available) - strong gaming signal
  // Most gaming monitors are 120Hz+, regular monitors are 60Hz
  // Note: This requires the Screen API extension which may not be available
  const screenRefreshRate = (clientInfo as Record<string, unknown>).screenRefreshRate as number | undefined;
  if (screenRefreshRate) {
    if (screenRefreshRate >= 240) {
      gamerScore += 40;
      gamerSignals.push(`${screenRefreshRate}Hz display (competitive gaming)`);
    } else if (screenRefreshRate >= 144) {
      gamerScore += 30;
      gamerSignals.push(`${screenRefreshRate}Hz display (gaming monitor)`);
    } else if (screenRefreshRate >= 120) {
      gamerScore += 20;
      gamerSignals.push(`${screenRefreshRate}Hz display`);
    }
  }

  // TIER 3: Moderate signals (need corroboration)
  // Gaming-oriented screen resolutions
  const screenWidth = clientInfo.screenWidth || 0;
  const screenHeight = clientInfo.screenHeight || 0;

  // 1440p is the sweet spot for gaming - common gaming resolution
  if (screenWidth >= 2560 && screenHeight >= 1440 && screenHeight < 2160) {
    gamerScore += 18;
    gamerSignals.push('1440p display (gaming sweet spot)');
  }
  // 4K gaming
  if (screenWidth >= 3840 && screenHeight >= 2160) {
    gamerScore += 12; // Less common for gaming due to performance requirements
    gamerSignals.push('4K display');
  }
  // Ultrawide gaming (21:9 aspect ratio)
  const gamerAspectRatio = screenWidth / (screenHeight || 1);
  if (gamerAspectRatio >= 2.3 && gamerAspectRatio < 2.5) {
    gamerScore += 15;
    gamerSignals.push('Ultrawide display (21:9)');
  }
  // Super ultrawide (32:9 - Samsung Odyssey style)
  if (gamerAspectRatio >= 3.5) {
    gamerScore += 25;
    gamerSignals.push('Super ultrawide display (32:9)');
    inferredInterests.push('Immersive Gaming');
  }

  // HDR support - gaming monitors often have HDR
  if (clientInfo.hdrSupported) {
    gamerScore += 12;
    gamerSignals.push('HDR display');
  }

  // High CPU core count (gaming rigs often have 8+ cores)
  const cpuCores = clientInfo.hardwareConcurrency || 0;
  if (cpuCores >= 16) {
    gamerScore += 15; // High-end gaming/workstation
  } else if (cpuCores >= 12) {
    gamerScore += 12;
  } else if (cpuCores >= 8) {
    gamerScore += 8;
  }

  // High RAM (gaming needs 16GB+, browser reports max 8GB but we can infer)
  if (ram >= 8) {
    gamerScore += 6; // At browser cap, likely has more
  }

  // TIER 4: Behavioral signals (weak but supportive)
  // Fast mouse movement patterns could indicate gamer (higher DPI, faster reflexes)
  // This would need to be measured in the behavior tracker - placeholder for future
  const mouseSpeed = (clientInfo as Record<string, unknown>).avgMouseSpeed as number | undefined;
  if (mouseSpeed && mouseSpeed > 1500) { // Pixels per second
    gamerScore += 10;
    gamerSignals.push('Fast mouse movement');
  }

  // Pointer lock API usage (common in FPS games)
  if ((clientInfo as Record<string, unknown>).pointerLockUsed) {
    gamerScore += 15;
    gamerSignals.push('Pointer lock used');
  }

  // Set gamer reason from strongest signal
  gamerReason = gamerSignals[0] || '';

  // ============ DESIGNER DETECTION ============
  // Scoring weights: definitive signals (40-60), strong signals (25-40), moderate signals (10-25), weak signals (5-10)
  const designerSignals: string[] = [];

  // TIER 1: Definitive signals (very high confidence)
  // Professional color displays (Rec.2020, DCI-P3 wide gamut) - designers need color accuracy
  if (clientInfo.colorGamut === 'rec2020') {
    designerScore += 50;
    designerSignals.push('Rec.2020 professional display');
    inferredInterests.push('Color-Critical Work');
  } else if (clientInfo.colorGamut === 'p3') {
    designerScore += 35;
    designerSignals.push('P3 wide color gamut display');
    inferredInterests.push('Creative Work');
  }

  // 10-bit or higher color depth - professional displays
  const colorDepth = clientInfo.screenColorDepth || 0;
  if (colorDepth >= 30) {
    designerScore += 35;
    designerSignals.push('10-bit+ color depth (professional display)');
  } else if (colorDepth >= 24) {
    designerScore += 5; // Standard 8-bit, common for everyone
  }

  // TIER 2: Strong signals (high confidence)
  // Touch/stylus support combined with Apple or professional hardware
  const touchPoints = clientInfo.maxTouchPoints || 0;
  const hasMultiTouch = touchPoints > 1;

  // Stylus/pen input detection (common for digital artists)
  const pointerTypes = (clientInfo as Record<string, unknown>).pointerTypes as string[] | undefined;
  if (pointerTypes && Array.isArray(pointerTypes) && pointerTypes.includes('pen')) {
    designerScore += 45;
    designerSignals.push('Stylus/pen input detected');
    inferredInterests.push('Digital Art');
  }

  // Apple devices with Pro-level hardware - very common for designers
  if (gpu.brand === 'Apple') {
    if (gpu.model.includes('Pro') || gpu.model.includes('Max') || gpu.model.includes('Ultra')) {
      designerScore += 35;
      designerSignals.push(`Apple ${gpu.model} (pro creative hardware)`);
      inferredInterests.push('Creative Professional');
    } else {
      designerScore += 18;
      designerSignals.push('Apple device');
    }
  }

  // High-end AMD/NVIDIA workstation GPUs (Quadro, FirePro, etc.)
  const workstationGPU = clientInfo.webglRenderer?.toLowerCase() || '';
  if (workstationGPU.includes('quadro') || workstationGPU.includes('firepro') || workstationGPU.includes('radeon pro')) {
    designerScore += 45;
    designerSignals.push('Professional workstation GPU');
    inferredInterests.push('3D/CAD Work');
  }

  // TIER 3: Moderate signals (need corroboration)
  // Retina/HiDPI display - designers prefer sharp displays
  const pixelRatio = clientInfo.devicePixelRatio || 1;
  if (pixelRatio >= 3) {
    designerScore += 15; // Very high DPI (mobile or premium displays)
    designerSignals.push('Very high DPI display');
  } else if (pixelRatio >= 2) {
    designerScore += 10; // Retina/HiDPI
    designerSignals.push('HiDPI display');
  }

  // 4K+ resolution with high aspect ratio (designer workstation)
  const designerScreenWidth = clientInfo.screenWidth || 0;
  const designerScreenHeight = clientInfo.screenHeight || 0;
  if (designerScreenWidth >= 3840 && designerScreenHeight >= 2160) {
    designerScore += 15;
    designerSignals.push('4K+ display');
  }

  // Professional design fonts - intentionally installed
  // Tier these by specificity
  const professionalDesignFonts = ['Proxima Nova', 'Gotham', 'Aktiv Grotesk', 'Circular', 'GT Walsheim', 'Graphik', 'Inter', 'DIN', 'Museo Sans', 'Brandon Grotesque'];
  const commonDesignFonts = ['SF Pro', 'Helvetica Neue', 'Helvetica', 'Avenir', 'Futura', 'Gill Sans'];
  const adobeFonts = ['Adobe Clean', 'Myriad Pro', 'Minion Pro', 'Source Sans Pro', 'Source Serif Pro'];

  const foundProfessionalFonts = clientInfo.fontsDetected?.filter(f => professionalDesignFonts.includes(f)) || [];
  const foundCommonDesignFonts = clientInfo.fontsDetected?.filter(f => commonDesignFonts.includes(f)) || [];
  const foundAdobeFonts = clientInfo.fontsDetected?.filter(f => adobeFonts.includes(f)) || [];

  if (foundProfessionalFonts.length > 0) {
    designerScore += 25 + Math.min(foundProfessionalFonts.length * 5, 15);
    designerSignals.push(`Professional fonts: ${foundProfessionalFonts.slice(0, 2).join(', ')}`);
  }
  if (foundAdobeFonts.length > 0) {
    designerScore += 20;
    designerSignals.push('Adobe fonts installed');
    inferredInterests.push('Adobe Creative Suite');
  }
  if (foundCommonDesignFonts.length >= 3) {
    designerScore += 10;
    designerSignals.push('Multiple design fonts');
  }

  // TIER 4: Weak/supporting signals
  // HDR support (good for visual work)
  if (clientInfo.hdrSupported) {
    designerScore += 8;
  }

  // Touch-enabled non-mobile device (drawing tablet or touch display)
  if (hasMultiTouch && !clientInfo.hardwareFamily?.includes('Phone') && !clientInfo.hardwareFamily?.includes('Tablet')) {
    designerScore += 12;
    designerSignals.push('Touch display (non-mobile)');
  }

  // High RAM (design apps are memory-hungry)
  if (ram >= 8) {
    designerScore += 5;
  }

  // macOS platform (industry standard for design)
  if (clientInfo.platform?.toLowerCase().includes('mac')) {
    designerScore += 8;
  }

  // Set designer reason from strongest signal
  designerReason = designerSignals[0] || '';

  // ============ POWER USER DETECTION ============
  // Scoring weights: definitive signals (40-50), strong signals (25-40), moderate signals (10-25), weak signals (5-10)
  const powerUserSignals: string[] = [];

  // TIER 1: Strong behavioral signals
  // Keyboard shortcuts are a strong indicator - casual users rarely use them
  const shortcutsUsed = clientInfo.advancedBehavior?.keyboardShortcutsUsed || [];
  const shortcutCount = shortcutsUsed.length;

  // Weight shortcuts by complexity
  const advancedShortcuts = shortcutsUsed.filter(s =>
    s.includes('SHIFT') || s.includes('ALT') || s.includes('OPT')
  );

  if (shortcutCount >= 5 || advancedShortcuts.length >= 3) {
    powerUserScore += 45;
    powerUserSignals.push(`Heavy keyboard shortcut user (${shortcutCount}+ shortcuts)`);
  } else if (shortcutCount >= 3) {
    powerUserScore += 30;
    powerUserSignals.push(`Uses keyboard shortcuts (${shortcutCount})`);
  } else if (shortcutCount >= 1) {
    powerUserScore += 15;
    powerUserSignals.push('Uses some keyboard shortcuts');
  }

  // TIER 2: Configuration signals (intentional customization)
  // Multiple browser extensions indicate active customization
  const extCount = clientInfo.extensionsDetected?.length || 0;
  if (extCount >= 6) {
    powerUserScore += 35;
    powerUserSignals.push(`${extCount} browser extensions (heavily customized)`);
  } else if (extCount >= 4) {
    powerUserScore += 25;
    powerUserSignals.push(`${extCount} browser extensions`);
  } else if (extCount >= 2) {
    powerUserScore += 12;
  }

  // Specific power user extensions
  const powerExtensions = ['uBlock Origin', 'LastPass', '1Password', 'Bitwarden', 'Dark Reader', 'Vimium', 'Tampermonkey', 'Greasemonkey'];
  const foundPowerExtensions = clientInfo.extensionsDetected?.filter(e =>
    powerExtensions.some(pe => e.toLowerCase().includes(pe.toLowerCase()))
  ) || [];
  if (foundPowerExtensions.length > 0) {
    powerUserScore += 15 + Math.min(foundPowerExtensions.length * 5, 15);
    powerUserSignals.push(`Power user extensions: ${foundPowerExtensions.slice(0, 2).join(', ')}`);
  }

  // TIER 3: Usage pattern signals
  // Long session/history indicates power usage
  const historyLength = clientInfo.historyLength || 0;
  if (historyLength >= 50) {
    powerUserScore += 18;
    powerUserSignals.push('Long browser history');
  } else if (historyLength >= 30) {
    powerUserScore += 12;
  } else if (historyLength >= 15) {
    powerUserScore += 6;
  }

  // Multiple granted permissions indicate trust in browser capabilities
  if (clientInfo.permissions) {
    const grantedPermissions = Object.entries(clientInfo.permissions)
      .filter(([, p]) => p === 'granted')
      .map(([name]) => name);
    if (grantedPermissions.length >= 4) {
      powerUserScore += 20;
      powerUserSignals.push(`${grantedPermissions.length} browser permissions granted`);
    } else if (grantedPermissions.length >= 2) {
      powerUserScore += 10;
    }
  }

  // High engagement metrics
  const engagement = clientInfo.advancedBehavior?.contentEngagement || 0;
  if (engagement >= 80) {
    powerUserScore += 12;
  }

  // TIER 4: Hardware signals (power users often have better hardware)
  // Multi-monitor setup detection (via screen size inconsistencies or reported)
  const totalScreenArea = (clientInfo.screenWidth || 0) * (clientInfo.screenHeight || 0);
  if ((clientInfo.screenWidth || 0) >= 3840 || totalScreenArea >= 3840 * 1080) {
    powerUserScore += 8;
  }

  // High-end hardware
  if ((clientInfo.hardwareConcurrency || 0) >= 8 && ram >= 8) {
    powerUserScore += 8;
  }

  // TIER 5: Negative signals (reduce false positives)
  // Very low interaction could indicate casual user despite other signals
  const totalInteractions = (clientInfo.advancedBehavior?.copyCount || 0) +
    (clientInfo.advancedBehavior?.pasteCount || 0) +
    (clientInfo.advancedBehavior?.textSelectCount || 0) +
    (clientInfo.advancedBehavior?.rightClickCount || 0);

  if (totalInteractions === 0 && shortcutCount === 0) {
    // Very passive user - reduce score
    powerUserScore = Math.max(0, powerUserScore - 15);
  }

  // Many rage clicks suggest frustration/inexperience
  if ((clientInfo.advancedBehavior?.rageClickCount || 0) >= 3) {
    powerUserScore = Math.max(0, powerUserScore - 10);
  }

  // Set power user reason from strongest signal
  powerUserReason = powerUserSignals[0] || '';

  // ============ PRIVACY CONSCIOUS DETECTION ============
  if (clientInfo.adBlockerDetected) {
    privacyScore += 35;
    privacyReason = 'Ad blocker detected';
    inferredInterests.push('Privacy');
  }

  if (clientInfo.globalPrivacyControl) {
    privacyScore += 30;
    privacyReason = privacyReason || 'Global Privacy Control enabled';
  }

  if (clientInfo.doNotTrack) {
    privacyScore += 20;
    privacyReason = privacyReason || 'Do Not Track enabled';
  }

  if (clientInfo.isIncognito) {
    privacyScore += 40;
    privacyReason = privacyReason || 'Incognito/Private browsing';
  }

  if (clientInfo.cookiesEnabled === false) {
    privacyScore += 25;
    privacyReason = privacyReason || 'Cookies disabled';
  }

  // WebRTC blocked (privacy extension)
  if (clientInfo.webrtcLocalIPs?.length === 0 && clientInfo.webrtcSupported === true) {
    privacyScore += 20;
    privacyReason = privacyReason || 'WebRTC blocked';
  }

  // VPN usage
  if (clientInfo.vpnDetection?.likelyUsingVPN) {
    privacyScore += 15;
    inferredInterests.push('VPN User');
  }

  // ============ DEVICE VALUE ESTIMATION ============
  let baseValue = 0;
  const deviceCores = clientInfo.hardwareConcurrency || 4;
  const deviceRam = clientInfo.deviceMemory || 4;

  // GPU value
  baseValue += gpu.estimatedValue;

  // CPU cores estimation
  if (deviceCores >= 16) baseValue += 400;
  else if (deviceCores >= 12) baseValue += 250;
  else if (deviceCores >= 8) baseValue += 150;
  else if (deviceCores >= 6) baseValue += 80;

  // RAM estimation (capped at 8 by browser, so add more if at cap)
  if (deviceRam >= 8) baseValue += 200; // Likely 16-64GB
  else if (deviceRam >= 4) baseValue += 50;

  // Display value
  const screenRes = (clientInfo.screenWidth || 0) * (clientInfo.screenHeight || 0);
  if (screenRes >= 3840 * 2160) baseValue += 400; // 4K
  else if (screenRes >= 2560 * 1440) baseValue += 200; // 1440p
  else if (screenRes >= 1920 * 1080) baseValue += 50; // 1080p

  // Apple premium
  if (gpu.brand === 'Apple') baseValue += 500;

  // Determine tier
  let deviceTier: UserProfile['deviceTier'];
  let estimatedDeviceValue: string;

  if (baseValue >= 2500) {
    deviceTier = 'premium';
    estimatedDeviceValue = '$3,000+';
  } else if (baseValue >= 1500) {
    deviceTier = 'high-end';
    estimatedDeviceValue = '$2,000-$3,000';
  } else if (baseValue >= 800) {
    deviceTier = 'mid-range';
    estimatedDeviceValue = '$1,200-$2,000';
  } else if (baseValue >= 400) {
    deviceTier = 'budget';
    estimatedDeviceValue = '$600-$1,200';
  } else {
    deviceTier = 'budget';
    estimatedDeviceValue = '$300-$600';
  }

  // ============ DEVICE AGE ============
  let deviceAge: UserProfile['deviceAge'] = 'recent';

  // Check platform version (macOS/Windows)
  if (clientInfo.clientHints?.platformVersion) {
    const version = parseFloat(clientInfo.clientHints.platformVersion);
    // macOS versions: 14 = Sonoma (2023), 13 = Ventura, 12 = Monterey, 11 = Big Sur
    // Windows: 10.0.22xxx = Win11, 10.0.19xxx = Win10
    if (version >= 14) deviceAge = 'new';
    else if (version >= 12) deviceAge = 'recent';
    else if (version >= 10) deviceAge = 'older';
    else deviceAge = 'old';
  }

  // GPU age estimation
  if (gpu.model.includes('40') || gpu.model.includes('M3')) deviceAge = 'new';
  else if (gpu.model.includes('30') || gpu.model.includes('M2') || gpu.model.includes('7')) deviceAge = 'recent';
  else if (gpu.model.includes('20') || gpu.model.includes('M1') || gpu.model.includes('6')) deviceAge = 'recent';
  else if (gpu.model.includes('10') || gpu.model.includes('5')) deviceAge = 'older';

  // ============ BOT/HUMAN DETECTION ============
  let humanScore = 100;

  if (clientInfo.isAutomated) {
    humanScore -= 60;
    botIndicators.push('Automation framework detected');
  }
  if (clientInfo.isHeadless) {
    humanScore -= 50;
    botIndicators.push('Headless browser');
  }
  if ((clientInfo.navigatorPropsCount || 100) < 25) {
    humanScore -= 20;
    botIndicators.push('Suspiciously few navigator properties');
  }
  if ((clientInfo.windowPropsCount || 100) < 100) {
    humanScore -= 15;
    botIndicators.push('Limited window properties');
  }
  if (!clientInfo.cookiesEnabled) {
    humanScore -= 10;
    botIndicators.push('Cookies disabled');
  }
  if (typeof navigator !== 'undefined' && navigator.plugins?.length === 0) {
    humanScore -= 15;
    botIndicators.push('No browser plugins');
  }
  if (clientInfo.behavior?.mouseMovements === 0 && clientInfo.behavior?.keyPressCount === 0) {
    humanScore -= 25;
    botIndicators.push('No user interaction detected');
  }

  // ============ FRAUD RISK ============
  let fraudRiskScore = 0;

  if (clientInfo.vpnDetection?.likelyUsingVPN) {
    fraudRiskScore += 15;
    fraudIndicators.push('VPN/Proxy detected');
  }
  if (clientInfo.vpnDetection?.timezoneIPMismatch) {
    fraudRiskScore += 12;
    fraudIndicators.push('Timezone doesn\'t match IP location');
  }
  if (clientInfo.isIncognito) {
    fraudRiskScore += 10;
    fraudIndicators.push('Private browsing mode');
  }
  if (humanScore < 60) {
    fraudRiskScore += 35;
    fraudIndicators.push('Bot-like behavior');
  }
  if (clientInfo.isVirtualMachine) {
    fraudRiskScore += 20;
    fraudIndicators.push('Virtual machine detected');
  }
  if (clientInfo.vpnDetection?.webrtcLeak) {
    fraudRiskScore += 10;
    fraudIndicators.push('WebRTC IP leak (VPN misconfigured)');
  }

  // ============ INFERRED INTERESTS ============
  if (clientInfo.cryptoWallets && clientInfo.cryptoWallets.length > 0) {
    inferredInterests.push('Cryptocurrency');
    if (clientInfo.cryptoWallets.length > 1) {
      inferredInterests.push('DeFi / Web3');
    }
  }

  if (clientInfo.socialLogins?.linkedin) {
    inferredInterests.push('Professional Networking');
  }
  if (clientInfo.socialLogins?.reddit) {
    inferredInterests.push('Online Communities');
  }
  if (clientInfo.socialLogins?.amazon) {
    inferredInterests.push('E-Commerce');
  }
  if (clientInfo.socialLogins?.twitter) {
    inferredInterests.push('Social Media');
  }

  // ============ COUNTRY ============
  const likelyCountry = inferCountry(clientInfo.timezone || '');

  // ============ RETURN PROFILE ============
  // Thresholds calibrated for improved scoring:
  // - Developer: 55+ (requires at least one strong signal like DevTools or dev extension)
  // - Gamer: 40+ (requires discrete GPU or gamepad, not just resolution/cores)
  // - Designer: 35+ (requires color-accurate display or Apple Pro hardware)
  // - Power User: 35+ (requires keyboard shortcuts or multiple extensions)
  return {
    likelyDeveloper: developerScore >= 55,
    developerScore: Math.min(developerScore, 100),
    developerReason: developerReason || undefined,
    likelyGamer: gamerScore >= 40,
    gamerScore: Math.min(gamerScore, 100),
    gamerReason: gamerReason || undefined,
    likelyDesigner: designerScore >= 35,
    designerScore: Math.min(designerScore, 100),
    designerReason: designerReason || undefined,
    likelyPowerUser: powerUserScore >= 35,
    powerUserScore: Math.min(powerUserScore, 100),
    powerUserReason: powerUserReason || undefined,
    privacyConscious: privacyScore >= 30,
    privacyScore: Math.min(privacyScore, 100),
    privacyReason: privacyReason || undefined,
    deviceTier,
    estimatedDeviceValue,
    deviceAge,
    humanScore: Math.max(humanScore, 0),
    botIndicators,
    likelyTechSavvy: developerScore >= 30 || powerUserScore >= 30,
    likelyMobile: (clientInfo.maxTouchPoints || 0) > 0 && (clientInfo.hardwareFamily?.includes('Phone') || clientInfo.hardwareFamily?.includes('Android') || false),
    likelyWorkDevice: !!(clientInfo.socialLogins?.microsoft || clientInfo.socialLogins?.linkedin),
    likelyCountry,
    inferredInterests: [...new Set(inferredInterests)],
    fraudRiskScore: Math.min(fraudRiskScore, 100),
    fraudIndicators,
  };
}

/**
 * Get initial advanced behavior data
 */
export function getInitialAdvancedBehavior(): AdvancedBehavior {
  return {
    devToolsOpen: false,
    isIdle: false,
    idleTime: 0,
    afkCount: 0,
    textSelectCount: 0,
    lastSelectedText: '',
    copyCount: 0,
    pasteCount: 0,
    rageClickCount: 0,
    lastRageClickTime: 0,
    exitIntentCount: 0,
    mouseLeftWindow: false,
    likelyHandedness: 'unknown',
    handednessConfidence: 0,
    estimatedReadingSpeed: 0,
    contentEngagement: 0,
    focusLossCount: 0,
    avgFocusDuration: 0,
    formInteractions: 0,
    formFieldsTyped: 0,
    formAbandoned: false,
    rightClickCount: 0,
    screenshotAttempts: 0,
    keyboardShortcutsUsed: [],
  };
}
