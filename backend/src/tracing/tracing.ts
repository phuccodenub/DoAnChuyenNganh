import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Enable basic diagnostics in non-production
if (process.env.NODE_ENV !== 'production') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
}

// Only enable OTLP exporter in production or when explicitly configured
// In development, tracing works locally without external collector
const enableOTLP = process.env.NODE_ENV === 'production' || process.env.ENABLE_OTLP === 'true';

// If OTLP is disabled, hard-disable any env-based auto exporter to avoid ECONNREFUSED noise
if (!enableOTLP) {
  // Prevent auto-exporters picking up default endpoints
  delete (process.env as any).OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  delete (process.env as any).OTEL_EXPORTER_OTLP_ENDPOINT;
  delete (process.env as any).OTEL_EXPORTER_OTLP_PROTOCOL;
  // Explicitly tell SDK to not export traces/metrics
  (process.env as any).OTEL_TRACES_EXPORTER = 'none';
  (process.env as any).OTEL_METRICS_EXPORTER = 'none';
}

let exporter: any = undefined;
if (enableOTLP) {
  exporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
    headers: {}
  });
}

export const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

export async function startTracing(): Promise<void> {
  try {
    await sdk.start();
    if (enableOTLP) {
      console.log('OpenTelemetry tracing started with OTLP export');
    } else {
      console.log('OpenTelemetry tracing started (local only, no OTLP export)');
    }
  } catch (error) {
    console.warn('OpenTelemetry tracing failed to start:', error);
    // Don't throw error to prevent app crash
  }
}

export async function shutdownTracing(): Promise<void> {
  try {
    await sdk.shutdown();
    console.log('OpenTelemetry tracing shutdown successfully');
  } catch (error) {
    console.warn('OpenTelemetry tracing shutdown failed:', error);
  }
}


