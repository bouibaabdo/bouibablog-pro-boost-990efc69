import { useEffect, useRef } from "react";
import { BEE_CONFIG } from "./config";
import { BeeState, BeeTransformState, BeeControllerOptions } from "./types";

export function useBeeController({ isReducedMotion }: BeeControllerOptions) {
  const isMobileRef = useRef<boolean>(false);
  const stateRef = useRef<BeeState>("idle");
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Position, Target, Velocity & Rotation tracking
  const posRef = useRef<[number, number, number]>([1.8, 0.5, 0]);
  const targetRef = useRef<[number, number, number]>([1.8, 0.5, 0]);
  const velRef = useRef<[number, number, number]>([0, 0, 0]);
  const rotRef = useRef<[number, number, number]>([0, 0, 0]);

  const lastInputTimeRef = useRef<number>(Date.now());
  const lastScrollYRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMobile = () => {
      isMobileRef.current = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const triggerActivity = () => {
      lastInputTimeRef.current = Date.now();
      if (stateRef.current === "idle") {
        stateRef.current = "following";
      }

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        stateRef.current = "idle";
      }, BEE_CONFIG.idleTimeoutMs);
    };

    // 1. Mouse Movement Listener
    const handlePointerMove = (e: PointerEvent) => {
      if (isReducedMotion) return;
      triggerActivity();

      const mult = isMobileRef.current ? BEE_CONFIG.mobileMotionMultiplier : 1;
      const normX = ((e.clientX / window.innerWidth) - 0.5) * 2;
      const normY = -((e.clientY / window.innerHeight) - 0.5) * 2;

      let targetX = normX * BEE_CONFIG.edgeMarginX * mult;
      let targetY = normY * BEE_CONFIG.edgeMarginY * mult;

      // Keep robot bee away from center reading area
      if (Math.abs(targetX) < BEE_CONFIG.safeZoneCenterRadius) {
        targetX = Math.sign(targetX || 1) * BEE_CONFIG.safeZoneCenterRadius;
      }

      targetRef.current[0] = targetX;
      targetRef.current[1] = targetY;
    };

    // 2. Scroll Listener (detect direction)
    const handleScroll = () => {
      if (isReducedMotion) return;
      triggerActivity();

      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      const scrollImpact = Math.max(-1, Math.min(1, deltaY * 0.015));
      targetRef.current[1] -= scrollImpact * BEE_CONFIG.followStrength;
    };

    // 3. Touch Swipe Listener (Mobile)
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isReducedMotion || e.touches.length === 0) return;
      triggerActivity();

      const deltaX = (e.touches[0].clientX - touchStartX) / window.innerWidth;
      const deltaY = (e.touches[0].clientY - touchStartY) / window.innerHeight;

      const mult = BEE_CONFIG.mobileMotionMultiplier;
      targetRef.current[0] += deltaX * BEE_CONFIG.edgeMarginX * mult;
      targetRef.current[1] -= deltaY * BEE_CONFIG.edgeMarginY * mult;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isReducedMotion]);

  // Frame Physics Step
  const updatePhysics = (delta: number, clockTime: number): BeeTransformState => {
    if (isReducedMotion) {
      return {
        position: [1.8, 0.4, 0],
        rotation: [0, -0.2, 0],
        velocity: [0, 0, 0],
        state: "idle",
        isMobile: isMobileRef.current,
      };
    }

    const currentPos = posRef.current;
    const targetPos = [...targetRef.current] as [number, number, number];

    // State Machine logic & Edge avoidance
    if (
      Math.abs(targetPos[0]) > BEE_CONFIG.edgeMarginX ||
      Math.abs(targetPos[1]) > BEE_CONFIG.edgeMarginY
    ) {
      stateRef.current = "edgeAvoidance";
    }

    if (stateRef.current === "edgeAvoidance") {
      targetPos[0] = Math.max(-BEE_CONFIG.edgeMarginX, Math.min(BEE_CONFIG.edgeMarginX, targetPos[0]));
      targetPos[1] = Math.max(-BEE_CONFIG.edgeMarginY, Math.min(BEE_CONFIG.edgeMarginY, targetPos[1]));
      stateRef.current = "reEnter";
    } else if (stateRef.current === "reEnter") {
      stateRef.current = "idle";
    }

    // Add gentle 3D hover drift during idle
    if (stateRef.current === "idle") {
      const floatX = Math.sin(clockTime * BEE_CONFIG.idleFrequency) * BEE_CONFIG.idleAmplitudeX;
      const floatY = Math.cos(clockTime * BEE_CONFIG.idleFrequency * 1.3) * BEE_CONFIG.idleAmplitudeY;
      targetPos[0] += floatX * 0.01;
      targetPos[1] += floatY * 0.01;
    }

    // Interpolation (Damping & Velocity)
    const dampFactor = 1 - Math.exp(-BEE_CONFIG.damping * (delta * 60));
    const vx = (targetPos[0] - currentPos[0]) * dampFactor;
    const vy = (targetPos[1] - currentPos[1]) * dampFactor;
    const vz = (targetPos[2] - currentPos[2]) * dampFactor;

    currentPos[0] += vx;
    currentPos[1] += vy;
    currentPos[2] += vz;

    velRef.current = [vx, vy, vz];

    // Bank & Pitch Rotations from Motion Vector
    const pitch = -vy * BEE_CONFIG.pitchStrength;
    const yaw = vx * 0.5 - 0.2;
    const roll = -vx * BEE_CONFIG.bankStrength;

    rotRef.current = [
      rotRef.current[0] + (pitch - rotRef.current[0]) * dampFactor,
      rotRef.current[1] + (yaw - rotRef.current[1]) * dampFactor,
      rotRef.current[2] + (roll - rotRef.current[2]) * dampFactor,
    ];

    return {
      position: currentPos,
      rotation: rotRef.current,
      velocity: velRef.current,
      state: stateRef.current,
      isMobile: isMobileRef.current,
    };
  };

  return { updatePhysics, isMobileRef };
}
