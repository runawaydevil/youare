/**
 * WebAssembly (WASM) fingerprinting module
 * Collects browser-specific WASM characteristics for fingerprinting purposes
 */

/**
 * WASM feature support detection results
 */
export interface WasmFeatures {
  /** Basic WASM support */
  basic: boolean;
  /** SIMD (Single Instruction Multiple Data) support */
  simd: boolean;
  /** Threading/SharedArrayBuffer support */
  threads: boolean;
  /** Exception handling proposal support */
  exceptions: boolean;
  /** Tail call optimization support */
  tailCall: boolean;
  /** Garbage collection proposal support */
  gc: boolean;
  /** Relaxed SIMD support */
  relaxedSimd: boolean;
  /** Multi-memory proposal support */
  multiMemory: boolean;
  /** Extended const expressions support */
  extendedConst: boolean;
  /** Reference types support */
  referenceTypes: boolean;
  /** Bulk memory operations support */
  bulkMemory: boolean;
  /** Mutable globals support */
  mutableGlobals: boolean;
  /** Sign extension operators support */
  signExtension: boolean;
  /** Non-trapping float-to-int conversions support */
  nonTrappingFptoint: boolean;
  /** BigInt support for i64 */
  bigInt: boolean;
}

/**
 * WASM timing fingerprint data
 */
export interface WasmTimingFingerprint {
  /** Average JS-to-WASM call latency in microseconds */
  callLatencyMicros: number;
  /** Standard deviation of call latency */
  callLatencyStdDev: number;
  /** Memory access timing in microseconds */
  memoryAccessMicros: number;
  /** Memory access standard deviation */
  memoryAccessStdDev: number;
  /** Instantiation time in milliseconds */
  instantiationTimeMs: number;
  /** Compilation time in milliseconds */
  compilationTimeMs: number;
}

/**
 * WASM compute benchmark results
 */
export interface WasmComputeBenchmark {
  /** Integer arithmetic operations per millisecond */
  intOpsPerMs: number;
  /** Floating point operations per millisecond */
  floatOpsPerMs: number;
  /** Memory throughput in MB/s */
  memoryThroughputMBps: number;
  /** Fibonacci(35) computation time in ms */
  fibonacciTimeMs: number;
  /** Matrix multiplication time in ms (4x4 * 1000 iterations) */
  matrixMulTimeMs: number;
  /** Estimated CPU performance tier (1-5) */
  cpuTier: number;
}

/**
 * Complete WASM fingerprint data
 */
export interface WasmFingerprint {
  /** Whether WASM is supported at all */
  supported: boolean;
  /** Feature detection results */
  features: WasmFeatures;
  /** Timing fingerprint data */
  timing: WasmTimingFingerprint | null;
  /** Compute benchmark results */
  benchmark: WasmComputeBenchmark | null;
  /** WASM memory limits */
  memoryLimits: {
    /** Maximum memory pages (64KB each) */
    maxPages: number;
    /** Initial memory pages */
    initialPages: number;
  } | null;
  /** Unique WASM fingerprint hash */
  fingerprintHash: string;
  /** Confidence score (0-100) */
  confidence: number;
  /** Collection timestamp */
  timestamp: number;
  /** Any errors encountered during collection */
  errors: string[];
}

/**
 * Simple hash function for fingerprinting
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Calculate standard deviation of an array of numbers
 */
function stdDev(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squareDiffs = arr.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(avgSquareDiff);
}

/**
 * Detect basic WASM support
 */
function detectBasicWasmSupport(): boolean {
  try {
    if (typeof WebAssembly !== 'object') return false;
    if (typeof WebAssembly.instantiate !== 'function') return false;
    if (typeof WebAssembly.compile !== 'function') return false;
    if (typeof WebAssembly.Module !== 'function') return false;
    if (typeof WebAssembly.Instance !== 'function') return false;
    if (typeof WebAssembly.Memory !== 'function') return false;
    if (typeof WebAssembly.Table !== 'function') return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Test if a specific WASM feature is supported by trying to compile a minimal module
 */
async function testWasmFeature(wasmBytes: Uint8Array): Promise<boolean> {
  try {
    await WebAssembly.compile(wasmBytes as BufferSource);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect all WASM features
 */
async function detectWasmFeatures(): Promise<WasmFeatures> {
  const features: WasmFeatures = {
    basic: detectBasicWasmSupport(),
    simd: false,
    threads: false,
    exceptions: false,
    tailCall: false,
    gc: false,
    relaxedSimd: false,
    multiMemory: false,
    extendedConst: false,
    referenceTypes: false,
    bulkMemory: false,
    mutableGlobals: false,
    signExtension: false,
    nonTrappingFptoint: false,
    bigInt: false,
  };

  if (!features.basic) return features;

  // SIMD detection - uses v128 type
  // Minimal module: (module (func (result v128) (v128.const i32x4 0 0 0 0)))
  const simdBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, // type section: () -> v128
    0x03, 0x02, 0x01, 0x00, // function section
    0x0a, 0x0a, 0x01, 0x08, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0b // code
  ]);
  features.simd = await testWasmFeature(simdBytes);

  // Threads detection - uses shared memory
  try {
    if (typeof SharedArrayBuffer !== 'undefined') {
      const sharedMem = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
      features.threads = sharedMem.buffer instanceof SharedArrayBuffer;
    }
  } catch {
    features.threads = false;
  }

  // Exception handling - uses try/catch instructions
  // Minimal module with exception handling
  const exceptionBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x04, 0x01, 0x60, 0x00, 0x00, // type section: () -> ()
    0x03, 0x02, 0x01, 0x00, // function section
    0x0d, 0x03, 0x01, 0x00, 0x00, // tag section
    0x0a, 0x08, 0x01, 0x06, 0x00, 0x06, 0x00, 0x07, 0x0b, 0x0b // code with try/catch
  ]);
  features.exceptions = await testWasmFeature(exceptionBytes);

  // Tail call detection
  // Minimal module: (module (func (return_call 0)))
  const tailCallBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x04, 0x01, 0x60, 0x00, 0x00, // type section
    0x03, 0x02, 0x01, 0x00, // function section
    0x0a, 0x06, 0x01, 0x04, 0x00, 0x12, 0x00, 0x0b // code with return_call
  ]);
  features.tailCall = await testWasmFeature(tailCallBytes);

  // GC detection - uses structref
  const gcBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x07, 0x01, 0x5f, 0x01, 0x7f, 0x01, 0x60, 0x00, 0x00, // type section with struct
    0x03, 0x02, 0x01, 0x01, // function section
    0x0a, 0x04, 0x01, 0x02, 0x00, 0x0b // empty function
  ]);
  features.gc = await testWasmFeature(gcBytes);

  // Relaxed SIMD detection (relaxed i32x4.trunc_sat_f32x4_s)
  const relaxedSimdBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7b, // type section
    0x03, 0x02, 0x01, 0x00, // function section
    0x0a, 0x12, 0x01, 0x10, 0x00, 0xfd, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfd, 0x01, 0x01, 0x0b
  ]);
  features.relaxedSimd = await testWasmFeature(relaxedSimdBytes);

  // Multi-memory detection
  const multiMemoryBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x05, 0x05, 0x02, 0x00, 0x01, 0x00, 0x01, // two memories
  ]);
  features.multiMemory = await testWasmFeature(multiMemoryBytes);

  // Reference types detection (funcref, externref)
  const refTypesBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x6f, // type section: () -> externref
    0x03, 0x02, 0x01, 0x00, // function section
    0x0a, 0x05, 0x01, 0x03, 0x00, 0xd0, 0x6f, 0x0b // code: ref.null extern
  ]);
  features.referenceTypes = await testWasmFeature(refTypesBytes);

  // Bulk memory operations (memory.copy, memory.fill)
  const bulkMemBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x04, 0x01, 0x60, 0x00, 0x00, // type section
    0x03, 0x02, 0x01, 0x00, // function section
    0x05, 0x03, 0x01, 0x00, 0x01, // memory section
    0x0a, 0x0e, 0x01, 0x0c, 0x00, 0x41, 0x00, 0x41, 0x00, 0x41, 0x00, 0xfc, 0x0a, 0x00, 0x00, 0x0b // memory.copy
  ]);
  features.bulkMemory = await testWasmFeature(bulkMemBytes);

  // Mutable globals
  const mutableGlobalsBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x06, 0x06, 0x01, 0x7f, 0x01, 0x41, 0x00, 0x0b, // mutable i32 global
  ]);
  features.mutableGlobals = await testWasmFeature(mutableGlobalsBytes);

  // Sign extension operators (i32.extend8_s, etc.)
  const signExtBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f, // type section
    0x03, 0x02, 0x01, 0x00, // function section
    0x0a, 0x07, 0x01, 0x05, 0x00, 0x41, 0x00, 0xc0, 0x0b // i32.extend8_s
  ]);
  features.signExtension = await testWasmFeature(signExtBytes);

  // Non-trapping float-to-int conversions
  const nonTrapBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f, // type section
    0x03, 0x02, 0x01, 0x00, // function section
    0x0a, 0x0a, 0x01, 0x08, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0xfc, 0x00, 0x0b // i32.trunc_sat_f32_s
  ]);
  features.nonTrappingFptoint = await testWasmFeature(nonTrapBytes);

  // BigInt support for i64
  features.bigInt = typeof BigInt !== 'undefined';

  // Extended const expressions
  const extConstBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    0x06, 0x08, 0x01, 0x7f, 0x00, 0x41, 0x01, 0x41, 0x01, 0x6a, 0x0b, // global with i32.add in init
  ]);
  features.extendedConst = await testWasmFeature(extConstBytes);

  return features;
}

/**
 * Create a minimal WASM module for timing tests
 */
function createTimingModule(): Uint8Array {
  // Minimal WASM module with an exported function that does some computation
  // (module
  //   (memory (export "mem") 1)
  //   (func (export "compute") (param i32) (result i32)
  //     (local i32)
  //     (local.set 1 (i32.const 0))
  //     (block
  //       (loop
  //         (br_if 1 (i32.ge_u (local.get 1) (local.get 0)))
  //         (local.set 1 (i32.add (local.get 1) (i32.const 1)))
  //         (br 0)
  //       )
  //     )
  //     (local.get 1)
  //   )
  //   (func (export "memAccess") (param i32 i32)
  //     (i32.store (local.get 0) (local.get 1))
  //   )
  //   (func (export "memRead") (param i32) (result i32)
  //     (i32.load (local.get 0))
  //   )
  // )
  return new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    // Type section
    0x01, 0x11, 0x04,
    0x60, 0x01, 0x7f, 0x01, 0x7f, // (i32) -> i32
    0x60, 0x02, 0x7f, 0x7f, 0x00, // (i32, i32) -> ()
    0x60, 0x01, 0x7f, 0x01, 0x7f, // (i32) -> i32
    0x60, 0x00, 0x00, // () -> ()
    // Function section
    0x03, 0x05, 0x04, 0x00, 0x01, 0x02, 0x03,
    // Memory section
    0x05, 0x03, 0x01, 0x00, 0x01, // 1 page memory
    // Export section
    0x07, 0x26, 0x04,
    0x03, 0x6d, 0x65, 0x6d, 0x02, 0x00, // "mem"
    0x07, 0x63, 0x6f, 0x6d, 0x70, 0x75, 0x74, 0x65, 0x00, 0x00, // "compute"
    0x09, 0x6d, 0x65, 0x6d, 0x41, 0x63, 0x63, 0x65, 0x73, 0x73, 0x00, 0x01, // "memAccess"
    0x07, 0x6d, 0x65, 0x6d, 0x52, 0x65, 0x61, 0x64, 0x00, 0x02, // "memRead"
    // Code section
    0x0a, 0x2d, 0x04,
    // compute function
    0x18, 0x01, 0x01, 0x7f, // 1 local i32
    0x41, 0x00, 0x21, 0x01, // local.set 1, i32.const 0
    0x02, 0x40, // block
    0x03, 0x40, // loop
    0x20, 0x01, 0x20, 0x00, 0x4f, 0x0d, 0x01, // br_if 1, i32.ge_u
    0x20, 0x01, 0x41, 0x01, 0x6a, 0x21, 0x01, // local.set 1, i32.add
    0x0c, 0x00, // br 0
    0x0b, 0x0b, // end loop, end block
    0x20, 0x01, // local.get 1
    0x0b, // end
    // memAccess function
    0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x36, 0x02, 0x00, 0x0b, // i32.store
    // memRead function
    0x07, 0x00, 0x20, 0x00, 0x28, 0x02, 0x00, 0x0b, // i32.load
    // noop function
    0x02, 0x00, 0x0b,
  ]);
}

/**
 * Create a compute benchmark WASM module
 */
function createBenchmarkModule(): Uint8Array {
  // Module with fibonacci, integer ops, and float ops
  return new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic
    0x01, 0x00, 0x00, 0x00, // version
    // Type section
    0x01, 0x0d, 0x03,
    0x60, 0x01, 0x7f, 0x01, 0x7f, // (i32) -> i32
    0x60, 0x01, 0x7f, 0x01, 0x7f, // (i32) -> i32
    0x60, 0x01, 0x7f, 0x01, 0x7d, // (i32) -> f32
    // Function section
    0x03, 0x04, 0x03, 0x00, 0x01, 0x02,
    // Memory section
    0x05, 0x03, 0x01, 0x00, 0x10, // 16 pages memory
    // Export section
    0x07, 0x1f, 0x03,
    0x09, 0x66, 0x69, 0x62, 0x6f, 0x6e, 0x61, 0x63, 0x63, 0x69, 0x00, 0x00, // "fibonacci"
    0x06, 0x69, 0x6e, 0x74, 0x4f, 0x70, 0x73, 0x00, 0x01, // "intOps"
    0x08, 0x66, 0x6c, 0x6f, 0x61, 0x74, 0x4f, 0x70, 0x73, 0x00, 0x02, // "floatOps"
    // Code section
    0x0a, 0x3d, 0x03,
    // fibonacci function (recursive)
    0x17, 0x00,
    0x20, 0x00, 0x41, 0x02, 0x49, // if n < 2
    0x04, 0x7f, 0x20, 0x00, // then return n
    0x05, // else
    0x20, 0x00, 0x41, 0x01, 0x6b, 0x10, 0x00, // fib(n-1)
    0x20, 0x00, 0x41, 0x02, 0x6b, 0x10, 0x00, // fib(n-2)
    0x6a, // add
    0x0b, 0x0b, // end if, end func
    // intOps function
    0x11, 0x01, 0x01, 0x7f, // 1 local
    0x41, 0x00, 0x21, 0x01, // local = 0
    0x03, 0x40, // loop
    0x20, 0x01, 0x41, 0x01, 0x6a, 0x21, 0x01, // local++
    0x20, 0x01, 0x20, 0x00, 0x49, 0x0d, 0x00, // br_if local < param
    0x0b,
    0x20, 0x01, 0x0b, // return local
    // floatOps function
    0x11, 0x01, 0x01, 0x7d, // 1 local f32
    0x43, 0x00, 0x00, 0x00, 0x00, 0x21, 0x01, // local = 0.0
    0x03, 0x40, // loop
    0x20, 0x01, 0x43, 0x00, 0x00, 0x80, 0x3f, 0x92, 0x21, 0x01, // local += 1.0
    0x20, 0x01, 0xa8, 0x20, 0x00, 0x49, 0x0d, 0x00, // br_if
    0x0b,
    0x20, 0x01, 0x0b, // return local
  ]);
}

/**
 * Measure WASM-to-JS call timing
 */
async function measureCallTiming(): Promise<{
  latencyMicros: number;
  stdDev: number;
  instantiationMs: number;
  compilationMs: number;
}> {
  const moduleBytes = createTimingModule();

  // Measure compilation time
  const compileStart = performance.now();
  const module = await WebAssembly.compile(moduleBytes as BufferSource);
  const compilationMs = performance.now() - compileStart;

  // Measure instantiation time
  const instantiateStart = performance.now();
  const instance = await WebAssembly.instantiate(module);
  const instantiationMs = performance.now() - instantiateStart;

  const exports = instance.exports as {
    compute: (n: number) => number;
    memAccess: (addr: number, val: number) => void;
    memRead: (addr: number) => number;
  };

  // Warm up
  for (let i = 0; i < 100; i++) {
    exports.compute(1);
  }

  // Measure call latency
  const iterations = 1000;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    exports.compute(1);
    const end = performance.now();
    latencies.push((end - start) * 1000); // Convert to microseconds
  }

  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const latencyStdDev = stdDev(latencies);

  return {
    latencyMicros: avgLatency,
    stdDev: latencyStdDev,
    instantiationMs,
    compilationMs,
  };
}

/**
 * Measure WASM memory access timing
 */
async function measureMemoryTiming(): Promise<{ accessMicros: number; stdDev: number }> {
  const moduleBytes = createTimingModule();
  const result = await WebAssembly.instantiate(moduleBytes as BufferSource);
  const instance = result.instance;

  const exports = instance.exports as {
    memAccess: (addr: number, val: number) => void;
    memRead: (addr: number) => number;
    mem: WebAssembly.Memory;
  };

  // Warm up
  for (let i = 0; i < 100; i++) {
    exports.memAccess(0, i);
    exports.memRead(0);
  }

  const iterations = 1000;
  const timings: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    exports.memAccess((i * 4) % 65536, i);
    exports.memRead((i * 4) % 65536);
    const end = performance.now();
    timings.push((end - start) * 1000);
  }

  const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
  const timingStdDev = stdDev(timings);

  return {
    accessMicros: avgTiming,
    stdDev: timingStdDev,
  };
}

/**
 * Run WASM compute benchmarks
 */
async function runBenchmarks(): Promise<WasmComputeBenchmark> {
  const moduleBytes = createBenchmarkModule();
  const result = await WebAssembly.instantiate(moduleBytes as BufferSource);
  const instance = result.instance;

  const exports = instance.exports as {
    fibonacci: (n: number) => number;
    intOps: (n: number) => number;
    floatOps: (n: number) => number;
  };

  // Fibonacci benchmark
  const fibStart = performance.now();
  exports.fibonacci(35);
  const fibTimeMs = performance.now() - fibStart;

  // Integer operations benchmark
  const intIterations = 1000000;
  const intStart = performance.now();
  exports.intOps(intIterations);
  const intTimeMs = performance.now() - intStart;
  const intOpsPerMs = intIterations / intTimeMs;

  // Float operations benchmark
  const floatIterations = 1000000;
  const floatStart = performance.now();
  exports.floatOps(floatIterations);
  const floatTimeMs = performance.now() - floatStart;
  const floatOpsPerMs = floatIterations / floatTimeMs;

  // Memory throughput benchmark (using JS typed arrays on WASM memory)
  const memory = new WebAssembly.Memory({ initial: 256 }); // 16MB
  const buffer = new Uint32Array(memory.buffer);
  const memSize = buffer.length;

  const memStart = performance.now();
  for (let i = 0; i < memSize; i++) {
    buffer[i] = i;
  }
  const memTimeMs = performance.now() - memStart;
  const memoryThroughputMBps = (memSize * 4) / 1024 / 1024 / (memTimeMs / 1000);

  // Matrix multiplication benchmark (4x4 matrix, 1000 iterations)
  const matrixStart = performance.now();
  for (let iter = 0; iter < 1000; iter++) {
    const a = new Float32Array(16);
    const b = new Float32Array(16);
    const c = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
      a[i] = Math.random();
      b[i] = Math.random();
    }
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[i * 4 + k] * b[k * 4 + j];
        }
        c[i * 4 + j] = sum;
      }
    }
  }
  const matrixMulTimeMs = performance.now() - matrixStart;

  // Calculate CPU tier (1-5 based on fibonacci time)
  let cpuTier: number;
  if (fibTimeMs < 50) cpuTier = 5; // High-end desktop
  else if (fibTimeMs < 100) cpuTier = 4; // Mid-range desktop / high-end mobile
  else if (fibTimeMs < 200) cpuTier = 3; // Low-end desktop / mid-range mobile
  else if (fibTimeMs < 400) cpuTier = 2; // Low-end mobile
  else cpuTier = 1; // Very slow device

  return {
    intOpsPerMs: Math.round(intOpsPerMs),
    floatOpsPerMs: Math.round(floatOpsPerMs),
    memoryThroughputMBps: Math.round(memoryThroughputMBps * 100) / 100,
    fibonacciTimeMs: Math.round(fibTimeMs * 100) / 100,
    matrixMulTimeMs: Math.round(matrixMulTimeMs * 100) / 100,
    cpuTier,
  };
}

/**
 * Detect WASM memory limits
 */
async function detectMemoryLimits(): Promise<{ maxPages: number; initialPages: number }> {
  let maxPages = 0;
  let initialPages = 1;

  // Test how many pages we can allocate
  // Start with binary search between 256 (16MB) and 65536 (4GB)
  let low = 256;
  let high = 65536;

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    try {
      const mem = new WebAssembly.Memory({ initial: 1, maximum: mid });
      // Try to grow to verify
      try {
        mem.grow(Math.min(mid - 1, 256));
        low = mid;
      } catch {
        high = mid - 1;
      }
    } catch {
      high = mid - 1;
    }
  }

  maxPages = low;

  // Test initial pages limit
  for (const pages of [1, 16, 64, 256, 1024]) {
    try {
      new WebAssembly.Memory({ initial: pages });
      initialPages = pages;
    } catch {
      break;
    }
  }

  return { maxPages, initialPages };
}

/**
 * Generate a unique fingerprint hash from all collected data
 */
function generateFingerprintHash(
  features: WasmFeatures,
  timing: WasmTimingFingerprint | null,
  benchmark: WasmComputeBenchmark | null,
  memoryLimits: { maxPages: number; initialPages: number } | null
): string {
  const components: string[] = [];

  // Features fingerprint
  components.push(
    Object.entries(features)
      .map(([k, v]) => `${k}:${v ? 1 : 0}`)
      .join(',')
  );

  // Timing fingerprint (quantized to reduce noise)
  if (timing) {
    components.push(
      [
        Math.round(timing.callLatencyMicros * 10),
        Math.round(timing.memoryAccessMicros * 10),
        Math.round(timing.instantiationTimeMs * 10),
        Math.round(timing.compilationTimeMs * 10),
      ].join('|')
    );
  }

  // Benchmark fingerprint (quantized)
  if (benchmark) {
    components.push(
      [
        Math.round(benchmark.intOpsPerMs / 1000),
        Math.round(benchmark.floatOpsPerMs / 1000),
        Math.round(benchmark.memoryThroughputMBps / 10),
        Math.round(benchmark.fibonacciTimeMs),
        benchmark.cpuTier,
      ].join('|')
    );
  }

  // Memory limits
  if (memoryLimits) {
    components.push(`mem:${memoryLimits.maxPages}:${memoryLimits.initialPages}`);
  }

  return hashString(components.join('::'));
}

/**
 * Calculate confidence score based on collected data quality
 */
function calculateConfidence(
  features: WasmFeatures,
  timing: WasmTimingFingerprint | null,
  benchmark: WasmComputeBenchmark | null,
  errors: string[]
): number {
  let confidence = 0;

  // Base confidence from features (40%)
  if (features.basic) {
    confidence += 20;
    const featureCount = Object.values(features).filter((v) => v === true).length;
    confidence += Math.min(20, featureCount * 2);
  }

  // Timing confidence (30%)
  if (timing) {
    confidence += 15;
    if (timing.callLatencyStdDev < timing.callLatencyMicros * 0.5) {
      confidence += 10; // Low variance = more reliable
    }
    if (timing.memoryAccessStdDev < timing.memoryAccessMicros * 0.5) {
      confidence += 5;
    }
  }

  // Benchmark confidence (20%)
  if (benchmark) {
    confidence += 10;
    if (benchmark.cpuTier > 0) {
      confidence += 5;
    }
    if (benchmark.memoryThroughputMBps > 0) {
      confidence += 5;
    }
  }

  // Error penalty (10%)
  confidence += Math.max(0, 10 - errors.length * 2);

  return Math.min(100, Math.max(0, confidence));
}

/**
 * Get complete WASM fingerprint
 */
export async function getWasmFingerprint(): Promise<WasmFingerprint> {
  const errors: string[] = [];
  const timestamp = Date.now();

  // Check basic support first
  if (!detectBasicWasmSupport()) {
    return {
      supported: false,
      features: {
        basic: false,
        simd: false,
        threads: false,
        exceptions: false,
        tailCall: false,
        gc: false,
        relaxedSimd: false,
        multiMemory: false,
        extendedConst: false,
        referenceTypes: false,
        bulkMemory: false,
        mutableGlobals: false,
        signExtension: false,
        nonTrappingFptoint: false,
        bigInt: false,
      },
      timing: null,
      benchmark: null,
      memoryLimits: null,
      fingerprintHash: hashString('wasm-unsupported'),
      confidence: 0,
      timestamp,
      errors: ['WebAssembly not supported'],
    };
  }

  // Collect features
  let features: WasmFeatures;
  try {
    features = await detectWasmFeatures();
  } catch (e) {
    errors.push(`Feature detection failed: ${e instanceof Error ? e.message : String(e)}`);
    features = {
      basic: true,
      simd: false,
      threads: false,
      exceptions: false,
      tailCall: false,
      gc: false,
      relaxedSimd: false,
      multiMemory: false,
      extendedConst: false,
      referenceTypes: false,
      bulkMemory: false,
      mutableGlobals: false,
      signExtension: false,
      nonTrappingFptoint: false,
      bigInt: typeof BigInt !== 'undefined',
    };
  }

  // Collect timing data
  let timing: WasmTimingFingerprint | null = null;
  try {
    const callTiming = await measureCallTiming();
    const memTiming = await measureMemoryTiming();
    timing = {
      callLatencyMicros: Math.round(callTiming.latencyMicros * 1000) / 1000,
      callLatencyStdDev: Math.round(callTiming.stdDev * 1000) / 1000,
      memoryAccessMicros: Math.round(memTiming.accessMicros * 1000) / 1000,
      memoryAccessStdDev: Math.round(memTiming.stdDev * 1000) / 1000,
      instantiationTimeMs: Math.round(callTiming.instantiationMs * 1000) / 1000,
      compilationTimeMs: Math.round(callTiming.compilationMs * 1000) / 1000,
    };
  } catch (e) {
    errors.push(`Timing measurement failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Run benchmarks
  let benchmark: WasmComputeBenchmark | null = null;
  try {
    benchmark = await runBenchmarks();
  } catch (e) {
    errors.push(`Benchmark failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Detect memory limits
  let memoryLimits: { maxPages: number; initialPages: number } | null = null;
  try {
    memoryLimits = await detectMemoryLimits();
  } catch (e) {
    errors.push(`Memory limits detection failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Generate fingerprint hash
  const fingerprintHash = generateFingerprintHash(features, timing, benchmark, memoryLimits);

  // Calculate confidence
  const confidence = calculateConfidence(features, timing, benchmark, errors);

  return {
    supported: true,
    features,
    timing,
    benchmark,
    memoryLimits,
    fingerprintHash,
    confidence,
    timestamp,
    errors,
  };
}

/**
 * Quick WASM support check (synchronous)
 */
export function isWasmSupported(): boolean {
  return detectBasicWasmSupport();
}

/**
 * Get just WASM features (faster than full fingerprint)
 */
export async function getWasmFeatures(): Promise<WasmFeatures> {
  return detectWasmFeatures();
}
