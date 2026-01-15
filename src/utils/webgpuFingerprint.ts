// @ts-nocheck
/**
 * WebGPU Fingerprinting Module
 * Collects GPU-specific information using the WebGPU API for browser fingerprinting
 * 
 * Note: @ts-nocheck is used because this file manually declares WebGPU types
 * that may conflict with DOM lib types in TypeScript
 */

// WebGPU type declarations for environments without @webgpu/types
declare global {
  interface GPU {
    requestAdapter(options?: GPURequestAdapterOptions): Promise<GPUAdapter | null>;
    getPreferredCanvasFormat(): GPUTextureFormat;
  }

  interface GPURequestAdapterOptions {
    powerPreference?: 'low-power' | 'high-performance';
  }

  interface GPUAdapter {
    readonly info: GPUAdapterInfo;
    readonly features: GPUFeatureSet;
    readonly limits: GPUSupportedLimits;
    readonly isFallbackAdapter: boolean;
    requestDevice(descriptor?: GPUDeviceDescriptor): Promise<GPUDevice>;
  }

  interface GPUAdapterInfo {
    readonly vendor: string;
    readonly architecture: string;
    readonly device: string;
    readonly description: string;
  }

  type GPUFeatureSet = Set<string>;
  type GPUTextureFormat = string;

  interface GPUSupportedLimits {
    readonly maxTextureDimension1D: number;
    readonly maxTextureDimension2D: number;
    readonly maxTextureDimension3D: number;
    readonly maxTextureArrayLayers: number;
    readonly maxBindGroups: number;
    readonly maxBindGroupsPlusVertexBuffers: number;
    readonly maxBindingsPerBindGroup: number;
    readonly maxDynamicUniformBuffersPerPipelineLayout: number;
    readonly maxDynamicStorageBuffersPerPipelineLayout: number;
    readonly maxSampledTexturesPerShaderStage: number;
    readonly maxSamplersPerShaderStage: number;
    readonly maxStorageBuffersPerShaderStage: number;
    readonly maxStorageTexturesPerShaderStage: number;
    readonly maxUniformBuffersPerShaderStage: number;
    readonly maxUniformBufferBindingSize: number;
    readonly maxStorageBufferBindingSize: number;
    readonly minUniformBufferOffsetAlignment: number;
    readonly minStorageBufferOffsetAlignment: number;
    readonly maxVertexBuffers: number;
    readonly maxBufferSize: number;
    readonly maxVertexAttributes: number;
    readonly maxVertexBufferArrayStride: number;
    readonly maxInterStageShaderComponents: number;
    readonly maxInterStageShaderVariables: number;
    readonly maxColorAttachments: number;
    readonly maxColorAttachmentBytesPerSample: number;
    readonly maxComputeWorkgroupStorageSize: number;
    readonly maxComputeInvocationsPerWorkgroup: number;
    readonly maxComputeWorkgroupSizeX: number;
    readonly maxComputeWorkgroupSizeY: number;
    readonly maxComputeWorkgroupSizeZ: number;
    readonly maxComputeWorkgroupsPerDimension: number;
  }

  interface GPUDeviceDescriptor {
    requiredFeatures?: string[];
    requiredLimits?: Record<string, number>;
  }

  interface GPUDevice {
    readonly queue: GPUQueue;
    createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
    createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
    createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
    createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
    createCommandEncoder(): GPUCommandEncoder;
    destroy(): void;
  }

  interface GPUQueue {
    writeBuffer(buffer: GPUBuffer, bufferOffset: number, data: BufferSource): void;
    submit(commandBuffers: GPUCommandBuffer[]): void;
    onSubmittedWorkDone(): Promise<void>;
  }

  interface GPUShaderModule {}
  interface GPUShaderModuleDescriptor {
    code: string;
  }

  interface GPUComputePipeline {
    getBindGroupLayout(index: number): GPUBindGroupLayout;
  }
  interface GPUComputePipelineDescriptor {
    layout: 'auto' | GPUPipelineLayout;
    compute: GPUProgrammableStage;
  }
  interface GPUPipelineLayout {}
  interface GPUProgrammableStage {
    module: GPUShaderModule;
    entryPoint: string;
  }

  interface GPUBuffer {
    mapAsync(mode: number): Promise<void>;
    getMappedRange(): ArrayBuffer;
    unmap(): void;
    destroy(): void;
  }
  interface GPUBufferDescriptor {
    size: number;
    usage: number;
  }

  interface GPUBindGroup {}
  interface GPUBindGroupLayout {}
  interface GPUBindGroupDescriptor {
    layout: GPUBindGroupLayout;
    entries: GPUBindGroupEntry[];
  }
  interface GPUBindGroupEntry {
    binding: number;
    resource: GPUBindingResource;
  }
  type GPUBindingResource = { buffer: GPUBuffer };

  interface GPUCommandEncoder {
    beginComputePass(): GPUComputePassEncoder;
    copyBufferToBuffer(
      source: GPUBuffer,
      sourceOffset: number,
      destination: GPUBuffer,
      destinationOffset: number,
      size: number
    ): void;
    finish(): GPUCommandBuffer;
  }

  interface GPUComputePassEncoder {
    setPipeline(pipeline: GPUComputePipeline): void;
    setBindGroup(index: number, bindGroup: GPUBindGroup): void;
    dispatchWorkgroups(x: number, y?: number, z?: number): void;
    end(): void;
  }

  interface GPUCommandBuffer {}

  // GPUBufferUsage and GPUMapMode are numeric flag constants
  const GPUBufferUsage: {
    readonly MAP_READ: number;
    readonly MAP_WRITE: number;
    readonly COPY_SRC: number;
    readonly COPY_DST: number;
    readonly INDEX: number;
    readonly VERTEX: number;
    readonly UNIFORM: number;
    readonly STORAGE: number;
    readonly INDIRECT: number;
    readonly QUERY_RESOLVE: number;
  };

  const GPUMapMode: {
    readonly READ: number;
    readonly WRITE: number;
  };
}

/**
 * WebGPU adapter information
 */
export interface WebGPUAdapterInfo {
  vendor: string;
  architecture: string;
  device: string;
  description: string;
  isFallbackAdapter: boolean;
}

/**
 * WebGPU device limits
 */
export interface WebGPULimits {
  maxTextureDimension1D: number;
  maxTextureDimension2D: number;
  maxTextureDimension3D: number;
  maxTextureArrayLayers: number;
  maxBindGroups: number;
  maxBindGroupsPlusVertexBuffers: number;
  maxBindingsPerBindGroup: number;
  maxDynamicUniformBuffersPerPipelineLayout: number;
  maxDynamicStorageBuffersPerPipelineLayout: number;
  maxSampledTexturesPerShaderStage: number;
  maxSamplersPerShaderStage: number;
  maxStorageBuffersPerShaderStage: number;
  maxStorageTexturesPerShaderStage: number;
  maxUniformBuffersPerShaderStage: number;
  maxUniformBufferBindingSize: number;
  maxStorageBufferBindingSize: number;
  minUniformBufferOffsetAlignment: number;
  minStorageBufferOffsetAlignment: number;
  maxVertexBuffers: number;
  maxBufferSize: number;
  maxVertexAttributes: number;
  maxVertexBufferArrayStride: number;
  maxInterStageShaderComponents: number;
  maxInterStageShaderVariables: number;
  maxColorAttachments: number;
  maxColorAttachmentBytesPerSample: number;
  maxComputeWorkgroupStorageSize: number;
  maxComputeInvocationsPerWorkgroup: number;
  maxComputeWorkgroupSizeX: number;
  maxComputeWorkgroupSizeY: number;
  maxComputeWorkgroupSizeZ: number;
  maxComputeWorkgroupsPerDimension: number;
}

/**
 * Compute shader timing fingerprint result
 */
export interface ComputeTimingFingerprint {
  /** Average execution time in milliseconds */
  avgExecutionTime: number;
  /** Standard deviation of execution times */
  stdDeviation: number;
  /** Timing pattern hash */
  patternHash: string;
  /** Number of iterations completed */
  iterations: number;
}

/**
 * Complete WebGPU fingerprint
 */
export interface WebGPUFingerprint {
  /** Whether WebGPU is available in this browser */
  available: boolean;
  /** Adapter information (vendor, architecture, device) */
  adapterInfo: WebGPUAdapterInfo | null;
  /** List of all supported GPU features */
  features: string[];
  /** Device limit values */
  limits: WebGPULimits | null;
  /** Preferred canvas format */
  preferredCanvasFormat: string | null;
  /** Compute shader timing fingerprint */
  computeTimingFingerprint: ComputeTimingFingerprint | null;
  /** Unique hash combining all WebGPU characteristics */
  fingerprintHash: string;
  /** Timestamp when fingerprint was collected */
  timestamp: number;
}

/**
 * Extended Navigator interface with WebGPU support
 */
interface NavigatorGPU extends Navigator {
  gpu?: GPU;
}

/**
 * Check if WebGPU is available in the current browser
 */
function isWebGPUAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

/**
 * Get the WebGPU adapter with detailed information
 */
async function getAdapterInfo(): Promise<WebGPUAdapterInfo | null> {
  try {
    const nav = navigator as NavigatorGPU;
    if (!nav.gpu) return null;

    // Request adapter with high-performance preference first
    let adapter = await nav.gpu.requestAdapter({
      powerPreference: 'high-performance',
    });

    // Fall back to any available adapter
    if (!adapter) {
      adapter = await nav.gpu.requestAdapter();
    }

    if (!adapter) return null;

    // Get adapter info
    const info = adapter.info;

    return {
      vendor: info.vendor || 'unknown',
      architecture: info.architecture || 'unknown',
      device: info.device || 'unknown',
      description: info.description || 'unknown',
      isFallbackAdapter: adapter.isFallbackAdapter || false,
    };
  } catch {
    return null;
  }
}

/**
 * Enumerate all supported WebGPU features
 */
async function getFeatures(): Promise<string[]> {
  try {
    const nav = navigator as NavigatorGPU;
    if (!nav.gpu) return [];

    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) return [];

    // Convert the features set to an array and sort for consistent ordering
    const features = Array.from(adapter.features).sort();
    return features;
  } catch {
    return [];
  }
}

/**
 * Collect all device limits (30+ values)
 */
async function getLimits(): Promise<WebGPULimits | null> {
  try {
    const nav = navigator as NavigatorGPU;
    if (!nav.gpu) return null;

    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) return null;

    const limits = adapter.limits;

    return {
      maxTextureDimension1D: limits.maxTextureDimension1D,
      maxTextureDimension2D: limits.maxTextureDimension2D,
      maxTextureDimension3D: limits.maxTextureDimension3D,
      maxTextureArrayLayers: limits.maxTextureArrayLayers,
      maxBindGroups: limits.maxBindGroups,
      maxBindGroupsPlusVertexBuffers: limits.maxBindGroupsPlusVertexBuffers,
      maxBindingsPerBindGroup: limits.maxBindingsPerBindGroup,
      maxDynamicUniformBuffersPerPipelineLayout: limits.maxDynamicUniformBuffersPerPipelineLayout,
      maxDynamicStorageBuffersPerPipelineLayout: limits.maxDynamicStorageBuffersPerPipelineLayout,
      maxSampledTexturesPerShaderStage: limits.maxSampledTexturesPerShaderStage,
      maxSamplersPerShaderStage: limits.maxSamplersPerShaderStage,
      maxStorageBuffersPerShaderStage: limits.maxStorageBuffersPerShaderStage,
      maxStorageTexturesPerShaderStage: limits.maxStorageTexturesPerShaderStage,
      maxUniformBuffersPerShaderStage: limits.maxUniformBuffersPerShaderStage,
      maxUniformBufferBindingSize: limits.maxUniformBufferBindingSize,
      maxStorageBufferBindingSize: limits.maxStorageBufferBindingSize,
      minUniformBufferOffsetAlignment: limits.minUniformBufferOffsetAlignment,
      minStorageBufferOffsetAlignment: limits.minStorageBufferOffsetAlignment,
      maxVertexBuffers: limits.maxVertexBuffers,
      maxBufferSize: limits.maxBufferSize,
      maxVertexAttributes: limits.maxVertexAttributes,
      maxVertexBufferArrayStride: limits.maxVertexBufferArrayStride,
      maxInterStageShaderComponents: limits.maxInterStageShaderComponents,
      maxInterStageShaderVariables: limits.maxInterStageShaderVariables,
      maxColorAttachments: limits.maxColorAttachments,
      maxColorAttachmentBytesPerSample: limits.maxColorAttachmentBytesPerSample,
      maxComputeWorkgroupStorageSize: limits.maxComputeWorkgroupStorageSize,
      maxComputeInvocationsPerWorkgroup: limits.maxComputeInvocationsPerWorkgroup,
      maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
      maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY,
      maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ,
      maxComputeWorkgroupsPerDimension: limits.maxComputeWorkgroupsPerDimension,
    };
  } catch {
    return null;
  }
}

/**
 * Get the preferred canvas format for this GPU
 */
function getPreferredCanvasFormat(): string | null {
  try {
    const nav = navigator as NavigatorGPU;
    if (!nav.gpu) return null;

    return nav.gpu.getPreferredCanvasFormat();
  } catch {
    return null;
  }
}

/**
 * WGSL compute shader for timing fingerprint
 * Uses atomic increment operations to measure GPU scheduling characteristics
 */
const TIMING_SHADER_CODE = `
// Atomic counter for measuring GPU scheduling patterns
@group(0) @binding(0) var<storage, read_write> counter: atomic<u32>;

// Output buffer to store timing-related data
@group(0) @binding(1) var<storage, read_write> results: array<u32>;

// Workgroup shared memory for local synchronization
var<workgroup> localCounter: atomic<u32>;

@compute @workgroup_size(64)
fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>,
  @builtin(workgroup_id) workgroupId: vec3<u32>
) {
  // Initialize local counter for first invocation in workgroup
  if (localId.x == 0u) {
    atomicStore(&localCounter, 0u);
  }

  // Synchronize workgroup
  workgroupBarrier();

  // Perform atomic increment on global counter
  // The order of these operations reveals GPU scheduling patterns
  let globalOrder = atomicAdd(&counter, 1u);

  // Also increment local counter to measure workgroup-level scheduling
  let localOrder = atomicAdd(&localCounter, 1u);

  // Store the combination of global and local ordering
  // This pattern is unique to each GPU's thread scheduling implementation
  let index = globalId.x;
  if (index < arrayLength(&results)) {
    results[index] = (globalOrder << 16u) | localOrder;
  }

  // Additional memory operations to stress-test the GPU
  // These timing characteristics vary between GPU architectures
  for (var i = 0u; i < 16u; i = i + 1u) {
    atomicAdd(&counter, 1u);
  }
}
`;

/**
 * Execute compute shader and collect timing fingerprint
 * Uses the AtomicIncrement technique to capture GPU scheduling patterns
 */
async function getComputeTimingFingerprint(): Promise<ComputeTimingFingerprint | null> {
  try {
    const nav = navigator as NavigatorGPU;
    if (!nav.gpu) return null;

    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) return null;

    const device = await adapter.requestDevice();
    if (!device) return null;

    // Create shader module
    const shaderModule = device.createShaderModule({
      code: TIMING_SHADER_CODE,
    });

    // Create compute pipeline
    const computePipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    const workgroupCount = 16;
    const workgroupSize = 64;
    const totalInvocations = workgroupCount * workgroupSize;

    // Create buffers
    const counterBuffer = device.createBuffer({
      size: 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    });

    const resultsBuffer = device.createBuffer({
      size: totalInvocations * 4,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    });

    const readbackBuffer = device.createBuffer({
      size: totalInvocations * 4,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    // Create bind group
    const bindGroup = device.createBindGroup({
      layout: computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: counterBuffer } },
        { binding: 1, resource: { buffer: resultsBuffer } },
      ],
    });

    // Run multiple iterations to collect timing data
    const iterations = 10;
    const executionTimes: number[] = [];
    const allResults: number[][] = [];

    for (let i = 0; i < iterations; i++) {
      // Reset counter
      device.queue.writeBuffer(counterBuffer, 0, new Uint32Array([0]));

      const startTime = performance.now();

      // Create command encoder
      const commandEncoder = device.createCommandEncoder();
      const computePass = commandEncoder.beginComputePass();
      computePass.setPipeline(computePipeline);
      computePass.setBindGroup(0, bindGroup);
      computePass.dispatchWorkgroups(workgroupCount);
      computePass.end();

      // Copy results to readback buffer
      commandEncoder.copyBufferToBuffer(
        resultsBuffer,
        0,
        readbackBuffer,
        0,
        totalInvocations * 4
      );

      // Submit and wait
      device.queue.submit([commandEncoder.finish()]);
      await device.queue.onSubmittedWorkDone();

      const endTime = performance.now();
      executionTimes.push(endTime - startTime);

      // Read back results
      await readbackBuffer.mapAsync(GPUMapMode.READ);
      const resultData = new Uint32Array(readbackBuffer.getMappedRange().slice(0));
      readbackBuffer.unmap();

      allResults.push(Array.from(resultData));
    }

    // Calculate statistics
    const avgExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / iterations;
    const variance = executionTimes.reduce((sum, time) => {
      return sum + Math.pow(time - avgExecutionTime, 2);
    }, 0) / iterations;
    const stdDeviation = Math.sqrt(variance);

    // Generate pattern hash from the scheduling results
    // The order of atomic operations reveals GPU-specific scheduling behavior
    const patternData = allResults.flat().slice(0, 256);
    const patternHash = hashArray(patternData);

    // Cleanup
    counterBuffer.destroy();
    resultsBuffer.destroy();
    readbackBuffer.destroy();
    device.destroy();

    return {
      avgExecutionTime: Math.round(avgExecutionTime * 1000) / 1000,
      stdDeviation: Math.round(stdDeviation * 1000) / 1000,
      patternHash,
      iterations,
    };
  } catch {
    return null;
  }
}

/**
 * Hash an array of numbers into a hex string
 */
function hashArray(arr: number[]): string {
  let hash = 0;
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    hash = ((hash << 5) - hash + value) | 0;
    hash = ((hash << 13) ^ hash) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Hash a string into a hex string
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a unique fingerprint hash from all WebGPU characteristics
 */
function generateFingerprintHash(
  adapterInfo: WebGPUAdapterInfo | null,
  features: string[],
  limits: WebGPULimits | null,
  preferredFormat: string | null,
  computeTiming: ComputeTimingFingerprint | null
): string {
  const components: string[] = [];

  // Adapter info
  if (adapterInfo) {
    components.push(`vendor:${adapterInfo.vendor}`);
    components.push(`arch:${adapterInfo.architecture}`);
    components.push(`device:${adapterInfo.device}`);
    components.push(`desc:${adapterInfo.description}`);
    components.push(`fallback:${adapterInfo.isFallbackAdapter}`);
  }

  // Features (sorted for consistency)
  components.push(`features:${features.join(',')}`);

  // Limits
  if (limits) {
    const limitValues = Object.entries(limits)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('|');
    components.push(`limits:${limitValues}`);
  }

  // Preferred format
  if (preferredFormat) {
    components.push(`format:${preferredFormat}`);
  }

  // Compute timing
  if (computeTiming) {
    components.push(`timing:${computeTiming.patternHash}`);
    components.push(`avgTime:${computeTiming.avgExecutionTime}`);
  }

  // Combine all components and hash
  const combined = components.join('||');

  // Use multiple hash passes for better distribution
  let hash1 = hashString(combined);
  let hash2 = hashString(combined.split('').reverse().join(''));

  // Combine hashes
  return `${hash1}-${hash2}`;
}

/**
 * Collect complete WebGPU fingerprint
 * This is the main exported function that gathers all WebGPU information
 *
 * @returns WebGPU fingerprint object or null if WebGPU is not available
 */
export async function getWebGPUFingerprint(): Promise<WebGPUFingerprint | null> {
  // Check if WebGPU is available
  if (!isWebGPUAvailable()) {
    return {
      available: false,
      adapterInfo: null,
      features: [],
      limits: null,
      preferredCanvasFormat: null,
      computeTimingFingerprint: null,
      fingerprintHash: 'webgpu-unavailable',
      timestamp: Date.now(),
    };
  }

  try {
    // Collect all information in parallel where possible
    const [adapterInfo, features, limits, preferredCanvasFormat] = await Promise.all([
      getAdapterInfo(),
      getFeatures(),
      getLimits(),
      Promise.resolve(getPreferredCanvasFormat()),
    ]);

    // Compute timing fingerprint separately as it's more resource-intensive
    let computeTimingFingerprint: ComputeTimingFingerprint | null = null;
    try {
      computeTimingFingerprint = await getComputeTimingFingerprint();
    } catch {
      // Compute shader timing may fail on some devices
    }

    // Generate unique fingerprint hash
    const fingerprintHash = generateFingerprintHash(
      adapterInfo,
      features,
      limits,
      preferredCanvasFormat,
      computeTimingFingerprint
    );

    return {
      available: true,
      adapterInfo,
      features,
      limits,
      preferredCanvasFormat,
      computeTimingFingerprint,
      fingerprintHash,
      timestamp: Date.now(),
    };
  } catch {
    return {
      available: false,
      adapterInfo: null,
      features: [],
      limits: null,
      preferredCanvasFormat: null,
      computeTimingFingerprint: null,
      fingerprintHash: 'webgpu-error',
      timestamp: Date.now(),
    };
  }
}

/**
 * Quick check for WebGPU availability without full fingerprinting
 */
export function isWebGPUSupported(): boolean {
  return isWebGPUAvailable();
}

/**
 * Get just the adapter info without full fingerprinting
 */
export async function getQuickAdapterInfo(): Promise<WebGPUAdapterInfo | null> {
  if (!isWebGPUAvailable()) return null;
  return getAdapterInfo();
}
