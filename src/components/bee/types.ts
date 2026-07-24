export type BeeState = "idle" | "following" | "edgeAvoidance" | "reEnter";

export interface BeeTransformState {
  position: [number, number, number];
  rotation: [number, number, number]; // [pitch, yaw, roll]
  velocity: [number, number, number];
  state: BeeState;
  isMobile: boolean;
}

export interface BeeControllerOptions {
  isReducedMotion: boolean;
}
