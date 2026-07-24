export const BEE_CONFIG = {
  // Scales — Prominent, cute & attractive on mobile and desktop
  beeScaleDesktop: 0.55,
  beeScaleMobile: 0.48,

  // Motion & Damping
  damping: 0.09,
  followStrength: 1.3,
  bankStrength: 1.5,
  pitchStrength: 0.9,
  mobileMotionMultiplier: 0.75,

  // Idle Animation
  idleAmplitudeX: 0.4,
  idleAmplitudeY: 0.3,
  idleFrequency: 1.2,
  idleRotationAmplitude: 0.08,

  // Robot Wings
  flapSpeed: 48,
  flapAmplitude: 0.6,

  // Safe Area Boundaries (Normalized world coordinates)
  edgeMarginX: 2.8,
  edgeMarginY: 1.8,
  safeZoneCenterRadius: 1.2, // Avoids middle reading area

  // Idle Timeout
  idleTimeoutMs: 1800,
} as const;
