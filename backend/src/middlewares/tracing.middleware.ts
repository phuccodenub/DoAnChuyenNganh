import { context, trace, SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function tracingMiddleware(req: Request, res: Response, next: NextFunction) {
  const tracer = trace.getTracer('lms-backend');
  
  // Generate requestId if not present
  const requestId = (req as any).requestId || req.headers['x-request-id'] || uuidv4();
  (req as any).requestId = requestId;
  
  const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
    kind: SpanKind.SERVER,
    attributes: {
      'http.method': req.method,
      'http.route': req.route?.path || req.path,
      'http.target': req.originalUrl || req.url,
      'http.user_agent': req.get('user-agent') || '',
      'request.id': String(requestId),
      'http.scheme': req.protocol,
      'http.host': req.get('host') || '',
      'http.client_ip': req.ip || req.connection.remoteAddress || ''
    }
  });

  // Set trace context on request
  (req as any).traceId = span.spanContext().traceId;
  (req as any).spanId = span.spanContext().spanId;

  const ctx = trace.setSpan(context.active(), span);
  context.with(ctx, () => {
    res.on('finish', () => {
      span.setAttribute('http.status_code', res.statusCode);
      span.setAttribute('http.response_size', res.get('content-length') || 0);
      
      if (res.statusCode >= 500) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Server error' });
        span.setAttribute('error', true);
      } else if (res.statusCode >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'Client error' });
        span.setAttribute('error', true);
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
      
      span.end();
    });

  res.on('error', (error: any) => {
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.end();
    });

    next();
  });
}

export function createChildSpan(name: string, attributes?: Record<string, any>) {
  const tracer = trace.getTracer('lms-backend');
  const span = tracer.startSpan(name, {
    kind: SpanKind.INTERNAL,
    attributes
  });
  
  return span;
}

export function addSpanEvent(span: any, name: string, attributes?: Record<string, any>) {
  if (span && span.addEvent) {
    span.addEvent(name, attributes);
  }
}

export function setSpanAttributes(span: any, attributes: Record<string, any>) {
  if (span && span.setAttributes) {
    span.setAttributes(attributes);
  }
}


