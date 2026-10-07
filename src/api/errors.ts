/**
 * Error type for the Gemini vision layer. Kept separate from the transport so
 * the UI can present stable recovery actions.
 */

export type VisionErrorKind =
  | 'no_key'
  | 'unauthorized'
  | 'billing'
  | 'rate_limited'
  | 'server'
  | 'network'
  | 'timeout'
  | 'malformed'
  | 'cancelled';

/** Every failure the UI has to say something distinct about. */
export class VisionError extends Error {
  readonly kind: VisionErrorKind;

  constructor(kind: VisionErrorKind, message: string) {
    super(message);
    this.name = 'VisionError';
    this.kind = kind;
  }
}
