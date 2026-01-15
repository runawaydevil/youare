/**
 * Chrome Built-in AI Integration Module
 * Leverages Chrome's local AI capabilities (Gemini Nano) for privacy-preserving user profiling
 */

import type { ClientInfo } from '../types';

// ============================================================================
// Global Type Declarations for Chrome Built-in AI
// ============================================================================

// Declare global LanguageModel API (Chrome 138+)
// API Reference: https://developer.chrome.com/docs/ai/prompt-api
declare const LanguageModel: {
  availability(): Promise<'available' | 'after-download' | 'no'>;
  params(): Promise<{
    defaultTopK: number;
    maxTopK: number;
    defaultTemperature: number;
    maxTemperature: number;
  }>;
  create(options?: {
    temperature?: number;
    topK?: number;
    signal?: AbortSignal;
    initialPrompts?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    monitor?: (monitor: { addEventListener: (event: string, callback: (e: { loaded: number; total: number }) => void) => void }) => void;
  }): Promise<{
    prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
    promptStreaming(input: string, options?: { signal?: AbortSignal }): ReadableStream<string>;
    clone(options?: object): Promise<unknown>;
    destroy(): void;
    inputUsage: number;
    inputQuota: number;
  }>;
} | undefined;

// ============================================================================
// Type Definitions for Chrome Built-in AI APIs
// ============================================================================

/** Availability states for Chrome AI APIs */
type AIAvailability = 'readily' | 'after-download' | 'no';

/** Base capabilities interface for AI APIs */
interface AICapabilities {
  available: AIAvailability;
  defaultTemperature?: number;
  defaultTopK?: number;
  maxTopK?: number;
}

/** Language Model session options */
interface LanguageModelCreateOptions {
  systemPrompt?: string;
  initialPrompts?: Array<{ role: 'user' | 'assistant'; content: string }>;
  temperature?: number;
  topK?: number;
  signal?: AbortSignal;
  monitor?: (monitor: AICreateMonitor) => void;
}

/** Download progress monitor */
interface AICreateMonitor {
  addEventListener(
    event: 'downloadprogress',
    callback: (e: { loaded: number; total: number }) => void
  ): void;
}

/** Language Model session */
interface LanguageModelSession {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  promptStreaming(
    input: string,
    options?: { signal?: AbortSignal }
  ): ReadableStream<string>;
  clone(): Promise<LanguageModelSession>;
  destroy(): void;
  tokensSoFar: number;
  maxTokens: number;
  tokensLeft: number;
}

/** Summarizer options */
interface SummarizerCreateOptions {
  type?: 'tl;dr' | 'key-points' | 'teaser' | 'headline';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
  signal?: AbortSignal;
  monitor?: (monitor: AICreateMonitor) => void;
}

/** Summarizer session */
interface SummarizerSession {
  summarize(input: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  summarizeStreaming(
    input: string,
    options?: { context?: string; signal?: AbortSignal }
  ): ReadableStream<string>;
  destroy(): void;
}

/** Translator options */
interface TranslatorCreateOptions {
  sourceLanguage: string;
  targetLanguage: string;
  signal?: AbortSignal;
  monitor?: (monitor: AICreateMonitor) => void;
}

/** Translator session */
interface TranslatorSession {
  translate(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  destroy(): void;
}

/** Language detection result */
interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
}

/** Language Detector session */
interface LanguageDetectorSession {
  detect(input: string, options?: { signal?: AbortSignal }): Promise<LanguageDetectionResult[]>;
  destroy(): void;
}

/** Chrome AI namespace extensions */
interface ChromeAINamespace {
  languageModel?: {
    capabilities(): Promise<AICapabilities>;
    create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
  };
  summarizer?: {
    capabilities(): Promise<AICapabilities & { supportsType(type: string): AIAvailability; supportsFormat(format: string): AIAvailability; supportsLength(length: string): AIAvailability }>;
    create(options?: SummarizerCreateOptions): Promise<SummarizerSession>;
  };
  translator?: {
    capabilities(): Promise<AICapabilities & { languagePairAvailable(source: string, target: string): AIAvailability }>;
    create(options: TranslatorCreateOptions): Promise<TranslatorSession>;
  };
  languageDetector?: {
    capabilities(): Promise<AICapabilities & { languageAvailable(language: string): AIAvailability }>;
    create(options?: { signal?: AbortSignal; monitor?: (monitor: AICreateMonitor) => void }): Promise<LanguageDetectorSession>;
  };
}

// Extend the Window interface
declare global {
  interface Window {
    ai?: ChromeAINamespace;
  }
}

// ============================================================================
// Exported Types
// ============================================================================

/** Status of each Chrome AI API */
export interface ChromeAIAPIStatus {
  /** Whether the API is present in the browser */
  supported: boolean;
  /** Whether the API is readily available without download */
  available: AIAvailability | 'unsupported';
  /** Additional capability information */
  capabilities?: Record<string, unknown>;
}

/** Overall Chrome AI availability status */
export interface ChromeAIStatus {
  /** Whether any Chrome AI features are available */
  chromeAISupported: boolean;
  /** Individual API statuses */
  apis: {
    languageModel: ChromeAIAPIStatus;
    summarizer: ChromeAIAPIStatus;
    translator: ChromeAIAPIStatus;
    languageDetector: ChromeAIAPIStatus;
  };
  /** Browser information */
  browser: {
    isChrome: boolean;
    version: number | null;
    meetsMinimumVersion: boolean;
  };
}

/** Profile generated locally using Chrome AI */
export interface LocalProfile {
  /** Developer profile score (0-100) */
  developerScore: number;
  /** Reasoning for developer score */
  developerReason: string;
  /** Gamer profile score (0-100) */
  gamerScore: number;
  /** Reasoning for gamer score */
  gamerReason: string;
  /** Designer profile score (0-100) */
  designerScore: number;
  /** Reasoning for designer score */
  designerReason: string;
  /** Device tier assessment */
  deviceTier: 'budget' | 'mid-range' | 'high-end' | 'premium';
  /** Device tier reasoning */
  deviceTierReason: string;
  /** General user profile summary */
  profileSummary: string;
  /** Raw AI response for debugging */
  rawResponse?: string;
  /** Whether this was generated by Chrome AI */
  generatedByChromeAI: true;
  /** Timestamp of generation */
  generatedAt: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Minimum Chrome version that supports built-in AI */
const MINIMUM_CHROME_VERSION = 127;

/** Timeout for AI operations in milliseconds */
const AI_OPERATION_TIMEOUT = 30000;

/** System prompt for user profiling */
const PROFILING_SYSTEM_PROMPT = `You are an analytics AI that analyzes browser fingerprint data to infer user profiles.
Analyze the provided fingerprint data and return a JSON object with these exact fields:
- developerScore: number 0-100 (likelihood of being a developer)
- developerReason: brief explanation
- gamerScore: number 0-100 (likelihood of being a gamer)
- gamerReason: brief explanation
- designerScore: number 0-100 (likelihood of being a designer)
- designerReason: brief explanation
- deviceTier: one of "budget", "mid-range", "high-end", "premium"
- deviceTierReason: brief explanation
- profileSummary: 2-3 sentence general profile

Base your analysis on signals like:
- Hardware: CPU cores, memory, GPU info
- Browser: Extensions (dev tools, design tools), features enabled
- Display: Resolution, color depth, HDR support
- Behavior: DevTools open, keyboard shortcuts used
- Software: Installed apps, wallet extensions

Return ONLY valid JSON, no other text.`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detect Chrome browser and version
 */
function detectChromeVersion(): { isChrome: boolean; version: number | null } {
  const ua = navigator.userAgent;
  const chromeMatch = ua.match(/Chrome\/(\d+)/);

  if (!chromeMatch) {
    return { isChrome: false, version: null };
  }

  // Check it's not Edge, Opera, or other Chromium browsers
  if (ua.includes('Edg/') || ua.includes('OPR/') || ua.includes('Opera/')) {
    return { isChrome: false, version: null };
  }

  return {
    isChrome: true,
    version: parseInt(chromeMatch[1], 10),
  };
}

/**
 * Create an AbortSignal with timeout
 */
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

/**
 * Extract relevant fingerprint data for AI analysis
 */
function extractFingerprintSummary(fingerprint: ClientInfo): string {
  const summary = {
    // Hardware
    hardware: {
      cpuCores: fingerprint.hardwareConcurrency,
      memory: fingerprint.deviceMemory,
      memoryCapped: fingerprint.deviceMemoryCapped,
      gpu: fingerprint.webglRenderer,
      gpuVendor: fingerprint.webglVendor,
      touchPoints: fingerprint.maxTouchPoints,
    },
    // Display
    display: {
      resolution: `${fingerprint.screenWidth}x${fingerprint.screenHeight}`,
      colorDepth: fingerprint.screenColorDepth,
      pixelRatio: fingerprint.devicePixelRatio,
      hdrSupported: fingerprint.hdrSupported,
      colorGamut: fingerprint.colorGamut,
      prefersColorScheme: fingerprint.prefersColorScheme,
    },
    // Browser & Extensions
    browser: {
      name: fingerprint.browserName,
      version: fingerprint.browserVersion,
      extensions: fingerprint.extensionsDetected,
      platform: fingerprint.platform,
    },
    // Capabilities
    capabilities: {
      webGPU: fingerprint.webGPUSupported,
      wasm: fingerprint.wasmSupported,
      gamepads: fingerprint.gamepadsSupported,
      midi: fingerprint.midiSupported,
      bluetooth: fingerprint.bluetoothSupported,
      usb: fingerprint.usbSupported,
    },
    // Software hints
    software: {
      cryptoWallets: fingerprint.cryptoWallets,
      installedApps: fingerprint.installedApps,
      fonts: fingerprint.fontsDetected?.slice(0, 10), // Limit for brevity
    },
    // Behavioral
    behavior: {
      devToolsOpen: fingerprint.advancedBehavior?.devToolsOpen,
      keyboardShortcuts: fingerprint.advancedBehavior?.keyboardShortcutsUsed,
    },
    // Connection
    connection: {
      type: fingerprint.connectionType,
      downlink: fingerprint.connectionDownlink,
    },
  };

  return JSON.stringify(summary, null, 2);
}

/**
 * Parse AI response into LocalProfile
 */
function parseAIResponse(response: string): Omit<LocalProfile, 'generatedByChromeAI' | 'generatedAt' | 'rawResponse'> {
  // Try to extract JSON from the response
  let jsonStr = response.trim();

  // Handle markdown code blocks
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find JSON object in response
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);

    return {
      developerScore: clampScore(parsed.developerScore),
      developerReason: String(parsed.developerReason || 'Unable to determine'),
      gamerScore: clampScore(parsed.gamerScore),
      gamerReason: String(parsed.gamerReason || 'Unable to determine'),
      designerScore: clampScore(parsed.designerScore),
      designerReason: String(parsed.designerReason || 'Unable to determine'),
      deviceTier: validateDeviceTier(parsed.deviceTier),
      deviceTierReason: String(parsed.deviceTierReason || 'Unable to determine'),
      profileSummary: String(parsed.profileSummary || 'Profile analysis unavailable'),
    };
  } catch (error) {
    // If JSON parsing fails, return default values
    console.warn('[ChromeAI] Failed to parse AI response:', error);
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Clamp score to 0-100 range
 */
function clampScore(value: unknown): number {
  const num = Number(value);
  if (isNaN(num)) return 50;
  return Math.max(0, Math.min(100, Math.round(num)));
}

/**
 * Validate device tier value
 */
function validateDeviceTier(value: unknown): 'budget' | 'mid-range' | 'high-end' | 'premium' {
  const validTiers = ['budget', 'mid-range', 'high-end', 'premium'] as const;
  const tier = String(value).toLowerCase();
  return validTiers.includes(tier as typeof validTiers[number])
    ? (tier as typeof validTiers[number])
    : 'mid-range';
}

// ============================================================================
// Main Exported Functions
// ============================================================================

/**
 * Check availability of all Chrome AI APIs
 * @returns Promise resolving to ChromeAIStatus object
 */
export async function isChromeAIAvailable(): Promise<ChromeAIStatus> {
  const browserInfo = detectChromeVersion();
  const meetsMinimumVersion = browserInfo.isChrome &&
    browserInfo.version !== null &&
    browserInfo.version >= MINIMUM_CHROME_VERSION;

  const status: ChromeAIStatus = {
    chromeAISupported: false,
    apis: {
      languageModel: { supported: false, available: 'unsupported' },
      summarizer: { supported: false, available: 'unsupported' },
      translator: { supported: false, available: 'unsupported' },
      languageDetector: { supported: false, available: 'unsupported' },
    },
    browser: {
      ...browserInfo,
      meetsMinimumVersion,
    },
  };

  // Check for Chrome AI APIs - try multiple access patterns
  // New API (Chrome 138+): LanguageModel, Summarizer, etc. as globals
  // Old API: window.ai.languageModel, etc.

  const hasWindowAI = typeof window !== 'undefined' && window.ai;
  const hasLanguageModelGlobal = typeof LanguageModel !== 'undefined';

  console.log('[ChromeAI] Checking availability:', {
    hasWindowAI,
    hasLanguageModelGlobal,
    browserInfo
  });

  // Check Language Model API (try new global first, then window.ai)
  if (hasLanguageModelGlobal && LanguageModel) {
    status.apis.languageModel.supported = true;
    try {
      // Chrome 138+ API uses LanguageModel.availability()
      // Returns: 'available' | 'after-download' | 'no'
      const availability = await LanguageModel.availability();
      console.log('[ChromeAI] LanguageModel.availability() returned:', availability);

      // Map 'available' to 'readily' for our internal status
      if (availability === 'available') {
        status.apis.languageModel.available = 'readily';
        status.chromeAISupported = true;
      } else if (availability === 'after-download') {
        status.apis.languageModel.available = 'after-download';
        status.chromeAISupported = true;
      } else {
        status.apis.languageModel.available = 'no';
      }

      // Also get params if available
      try {
        const params = await LanguageModel.params();
        console.log('[ChromeAI] LanguageModel.params():', params);
        status.apis.languageModel.capabilities = {
          defaultTemperature: params.defaultTemperature,
          maxTemperature: params.maxTemperature,
          defaultTopK: params.defaultTopK,
          maxTopK: params.maxTopK,
        };
      } catch (e) {
        // params() may not be available
      }
    } catch (error) {
      console.warn('[ChromeAI] Error checking LanguageModel availability:', error);
      status.apis.languageModel.available = 'no';
    }
  } else if (hasWindowAI && window.ai?.languageModel) {
    status.apis.languageModel.supported = true;
    try {
      const capabilities = await window.ai.languageModel.capabilities();
      status.apis.languageModel.available = capabilities.available;
      status.apis.languageModel.capabilities = {
        defaultTemperature: capabilities.defaultTemperature,
        defaultTopK: capabilities.defaultTopK,
        maxTopK: capabilities.maxTopK,
      };
      if (capabilities.available !== 'no') {
        status.chromeAISupported = true;
      }
    } catch (error) {
      console.warn('[ChromeAI] Error checking LanguageModel capabilities:', error);
      status.apis.languageModel.available = 'no';
    }
  }

  // If no APIs found at all, return early
  if (!hasWindowAI && !hasLanguageModelGlobal) {
    console.log('[ChromeAI] No Chrome AI APIs found');
    return status;
  }

  const ai = hasWindowAI ? window.ai : null;

  // Check Summarizer API
  if (ai?.summarizer) {
    status.apis.summarizer.supported = true;
    try {
      const capabilities = await ai.summarizer.capabilities();
      status.apis.summarizer.available = capabilities.available;
      if (capabilities.available !== 'no') {
        status.chromeAISupported = true;
      }
    } catch (error) {
      console.warn('[ChromeAI] Error checking Summarizer capabilities:', error);
      status.apis.summarizer.available = 'no';
    }
  }

  // Check Translator API
  if (ai?.translator) {
    status.apis.translator.supported = true;
    try {
      const capabilities = await ai.translator.capabilities();
      status.apis.translator.available = capabilities.available;
      if (capabilities.available !== 'no') {
        status.chromeAISupported = true;
      }
    } catch (error) {
      console.warn('[ChromeAI] Error checking Translator capabilities:', error);
      status.apis.translator.available = 'no';
    }
  }

  // Check Language Detector API
  if (ai?.languageDetector) {
    status.apis.languageDetector.supported = true;
    try {
      const capabilities = await ai.languageDetector.capabilities();
      status.apis.languageDetector.available = capabilities.available;
      if (capabilities.available !== 'no') {
        status.chromeAISupported = true;
      }
    } catch (error) {
      console.warn('[ChromeAI] Error checking LanguageDetector capabilities:', error);
      status.apis.languageDetector.available = 'no';
    }
  }

  return status;
}

/**
 * Profile a user using Chrome's built-in AI (Gemini Nano)
 * Falls back gracefully if Chrome AI is not available
 *
 * @param fingerprint - Client fingerprint data to analyze
 * @returns Promise resolving to LocalProfile or null if unavailable
 */
export async function profileWithChromeAI(
  fingerprint: ClientInfo
): Promise<LocalProfile | null> {
  // First check if Chrome AI is available
  const aiStatus = await isChromeAIAvailable();

  if (!aiStatus.chromeAISupported) {
    console.info('[ChromeAI] Chrome AI not available, returning null');
    return null;
  }

  // Check specifically for Language Model API
  if (
    !aiStatus.apis.languageModel.supported ||
    aiStatus.apis.languageModel.available === 'no' ||
    aiStatus.apis.languageModel.available === 'unsupported'
  ) {
    console.info('[ChromeAI] Language Model API not available');
    return null;
  }

  // Try new global LanguageModel API first (Chrome 138+), then fall back to window.ai
  const hasLanguageModelGlobal = typeof LanguageModel !== 'undefined';
  const ai = window.ai;

  if (!hasLanguageModelGlobal && !ai?.languageModel) {
    console.info('[ChromeAI] No LanguageModel API found');
    return null;
  }

  // Use a more flexible type since API may vary between versions
  let session: {
    prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
    destroy(): void;
  } | null = null;

  try {
    // Create the Language Model session
    const signal = createTimeoutSignal(AI_OPERATION_TIMEOUT);

    // Handle "after-download" state - model may need to download first
    if (aiStatus.apis.languageModel.available === 'after-download') {
      console.info('[ChromeAI] Model needs to download, this may take a moment...');
    }

    // Try new global API first (Chrome 138+)
    if (hasLanguageModelGlobal && LanguageModel) {
      console.info('[ChromeAI] Using global LanguageModel API (Chrome 138+)');

      // New API uses initialPrompts with role: 'system' instead of systemPrompt
      session = await LanguageModel.create({
        temperature: 0.3,
        topK: 10,
        signal,
        initialPrompts: [
          { role: 'system', content: PROFILING_SYSTEM_PROMPT }
        ],
        monitor: (monitor) => {
          monitor.addEventListener('downloadprogress', (e) => {
            const percent = Math.round((e.loaded / e.total) * 100);
            console.info(`[ChromeAI] Model download progress: ${percent}%`);
          });
        },
      });
    } else if (ai?.languageModel) {
      console.info('[ChromeAI] Using window.ai.languageModel API (legacy)');

      // Legacy API uses systemPrompt
      session = await ai.languageModel.create({
        systemPrompt: PROFILING_SYSTEM_PROMPT,
        temperature: 0.3,
        topK: 10,
        signal,
        monitor: (monitor: AICreateMonitor) => {
          monitor.addEventListener('downloadprogress', (e) => {
            const percent = Math.round((e.loaded / e.total) * 100);
            console.info(`[ChromeAI] Model download progress: ${percent}%`);
          });
        },
      });
    } else {
      console.info('[ChromeAI] No LanguageModel API available');
      return null;
    }

    // Extract fingerprint summary for analysis
    const fingerprintSummary = extractFingerprintSummary(fingerprint);

    // Build the prompt
    const userPrompt = `Analyze this browser fingerprint data and return a user profile as JSON:

${fingerprintSummary}

Remember to return ONLY valid JSON with the required fields.`;

    // Get the AI response
    if (!session) {
      console.info('[ChromeAI] Session creation failed');
      return null;
    }

    const response = await session.prompt(userPrompt, {
      signal: createTimeoutSignal(AI_OPERATION_TIMEOUT),
    });

    // Parse the response
    const profileData = parseAIResponse(response);

    const result: LocalProfile = {
      ...profileData,
      rawResponse: response,
      generatedByChromeAI: true,
      generatedAt: Date.now(),
    };

    return result;

  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('[ChromeAI] Operation timed out');
      } else if (error.message.includes('NotSupportedError')) {
        console.warn('[ChromeAI] Feature not supported in this context');
      } else if (error.message.includes('NotAllowedError')) {
        console.warn('[ChromeAI] AI feature not allowed (may require user gesture or flag)');
      } else {
        console.error('[ChromeAI] Error during profiling:', error.message);
      }
    } else {
      console.error('[ChromeAI] Unknown error during profiling:', error);
    }

    return null;

  } finally {
    // Clean up the session
    if (session) {
      try {
        session.destroy();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Quick check if Chrome AI is likely supported (synchronous)
 * Use isChromeAIAvailable() for a complete async check
 */
export function isChromeBrowser(): boolean {
  const { isChrome, version } = detectChromeVersion();
  return isChrome && version !== null && version >= MINIMUM_CHROME_VERSION;
}

/**
 * Get a simple status message for Chrome AI availability
 */
export async function getChromeAIStatusMessage(): Promise<string> {
  const status = await isChromeAIAvailable();

  if (!status.browser.isChrome) {
    return 'Chrome AI requires Google Chrome browser';
  }

  if (!status.browser.meetsMinimumVersion) {
    return `Chrome AI requires Chrome ${MINIMUM_CHROME_VERSION}+ (you have ${status.browser.version})`;
  }

  if (!status.chromeAISupported) {
    return 'Chrome AI APIs not available (may need to enable chrome://flags/#optimization-guide-on-device-model)';
  }

  const availableAPIs = Object.entries(status.apis)
    .filter(([, api]) => api.available === 'readily')
    .map(([name]) => name);

  if (availableAPIs.length === 0) {
    return 'Chrome AI model may need to download first';
  }

  return `Chrome AI ready with: ${availableAPIs.join(', ')}`;
}
