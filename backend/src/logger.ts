// Simple JSON logger used by the backend. Exports level helpers and
// an installConsole() function to override global console methods so
// existing console.log/console.error/... calls emit structured JSON.

type Meta = Record<string, unknown> | undefined;

function timestamp() {
  return new Date().toISOString();
}

function safeStringify(v: unknown) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return String(v);
  }
}

function formatJson(level: string, message: string, meta?: Meta) {
  const payload: Record<string, unknown> = {
    ts: timestamp(),
    level,
    msg: message,
  };
  if (meta !== undefined) payload.meta = meta;
  return payload;
}

function output(payload: Record<string, unknown>) {
  // Ensure single-line JSON for logs
  try {
    // Use synchronous stdout write to avoid reordering in some environments
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  } catch (e) {
    // Fallback
    // eslint-disable-next-line no-console
    console.error('Failed to write log JSON', e);
  }
}

export function info(message: string, meta?: Meta) {
  output(formatJson('info', message, meta));
}

export function warn(message: string, meta?: Meta) {
  output(formatJson('warn', message, meta));
}

export function error(message: string, meta?: Meta) {
  output(formatJson('error', message, meta));
}

export function debug(message: string, meta?: Meta) {
  output(formatJson('debug', message, meta));
}

// Replace global console methods with JSON-emitting versions.
export function installConsole(overrides?: { level?: 'info' | 'warn' | 'error' | 'debug' }) {
  // keep originals in case
  const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: (console as any).debug ? (console as any).debug.bind(console) : console.log.bind(console),
  };

  // Helper to normalize arguments: first arg as message, rest as meta
  const makeFn = (level: 'info' | 'warn' | 'error' | 'debug') => (...args: unknown[]) => {
    if (args.length === 0) {
      output(formatJson(level, ''));
      return;
    }
    const [first, ...rest] = args;
    const msg = typeof first === 'string' ? first : safeStringify(first);
    const meta = rest.length ? { args: rest.map((r) => (typeof r === 'string' ? r : safeStringify(r))) } : undefined;
    output(formatJson(level, msg, meta));
  };

  // Override
  // eslint-disable-next-line no-console
  console.log = makeFn('info') as any;
  // eslint-disable-next-line no-console
  console.info = makeFn('info') as any;
  // eslint-disable-next-line no-console
  console.warn = makeFn('warn') as any;
  // eslint-disable-next-line no-console
  console.error = makeFn('error') as any;
  // eslint-disable-next-line no-console
  (console as any).debug = makeFn('debug');

  return () => {
    // restore originals
    // eslint-disable-next-line no-console
    console.log = orig.log;
    // eslint-disable-next-line no-console
    console.info = orig.info;
    // eslint-disable-next-line no-console
    console.warn = orig.warn;
    // eslint-disable-next-line no-console
    console.error = orig.error;
    // eslint-disable-next-line no-console
    (console as any).debug = orig.debug;
  };
}
