import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { RobotBeeCanvas } from "./RobotBeeCanvas";
import { RobotBeeFallback } from "./RobotBeeFallback";

export function RobotBeeOverlay() {
  const [mounted, setMounted] = useState<boolean>(false);
  const isReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isReducedMotion) {
    return <RobotBeeFallback />;
  }

  return <RobotBeeCanvas isReducedMotion={isReducedMotion} />;
}
