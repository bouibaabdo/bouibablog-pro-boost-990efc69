import { useEffect, useRef } from "react";
import { useBeeController } from "./useBeeController";
import { BEE_CONFIG } from "./config";

interface RobotBeeCanvasProps {
  isReducedMotion: boolean;
}

export function RobotBeeCanvas({ isReducedMotion }: RobotBeeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { updatePhysics } = useBeeController({ isReducedMotion });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const clockTime = now / 1000;

      ctx.clearRect(0, 0, width, height);

      // Get physics & motion state from 3D controller
      const { position, rotation, isMobile } = updatePhysics(delta, clockTime);

      const isDark = document.documentElement.classList.contains("dark");
      const scaleBase = isMobile ? BEE_CONFIG.beeScaleMobile : BEE_CONFIG.beeScaleDesktop;
      const scaleMultiplier = scaleBase * (width / 1200);

      // Convert world position ([-3, 3]) to canvas screen coordinates
      const centerX = width / 2 + position[0] * (width / 6);
      const centerY = height / 2 - position[1] * (height / 4);

      const pitch = rotation[0];
      const yaw = rotation[1];
      const roll = rotation[2];

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scaleMultiplier, scaleMultiplier);
      ctx.rotate(roll * 0.4);

      // ── 1. GLOWING JET THRUSTER TRAIL (Back) ──
      const thrusterGlow = ctx.createRadialGradient(0, 45, 2, 0, 45, 28);
      thrusterGlow.addColorStop(0, "rgba(20, 184, 166, 0.9)");
      thrusterGlow.addColorStop(0.5, "rgba(56, 189, 248, 0.5)");
      thrusterGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = thrusterGlow;
      ctx.beginPath();
      ctx.arc(0, 45, 28, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. FIBER-OPTIC ROBOT WINGS (Animated Flapping) ──
      const flapAngle = isReducedMotion
        ? 0.2
        : Math.sin(clockTime * BEE_CONFIG.flapSpeed) * BEE_CONFIG.flapAmplitude;

      // Left Robot Wing
      ctx.save();
      ctx.translate(-15, -10);
      ctx.rotate(-0.4 - flapAngle);
      const leftWingGrad = ctx.createLinearGradient(-35, -35, 0, 0);
      leftWingGrad.addColorStop(0, "rgba(224, 242, 254, 0.85)");
      leftWingGrad.addColorStop(0.5, "rgba(20, 184, 166, 0.6)");
      leftWingGrad.addColorStop(1, "rgba(14, 165, 233, 0.2)");

      ctx.fillStyle = leftWingGrad;
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(13, 110, 110, 0.8)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(-25, -25, 30, 12, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Internal wing circuit lines
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(-35, -32);
      ctx.strokeStyle = "rgba(20, 184, 166, 0.7)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Right Robot Wing
      ctx.save();
      ctx.translate(15, -10);
      ctx.rotate(0.4 + flapAngle);
      const rightWingGrad = ctx.createLinearGradient(35, -35, 0, 0);
      rightWingGrad.addColorStop(0, "rgba(224, 242, 254, 0.85)");
      rightWingGrad.addColorStop(0.5, "rgba(20, 184, 166, 0.6)");
      rightWingGrad.addColorStop(1, "rgba(14, 165, 233, 0.2)");

      ctx.fillStyle = rightWingGrad;
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(13, 110, 110, 0.8)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(25, -25, 30, 12, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Internal wing circuit lines
      ctx.beginPath();
      ctx.moveTo(10, -10);
      ctx.lineTo(35, -32);
      ctx.strokeStyle = "rgba(20, 184, 166, 0.7)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── 3. METALLIC ROBOT BEE BODY (Abdomen & Armor Rings) ──
      // Gold & Charcoal Striped Metallic Capsule Body
      const bodyGrad = ctx.createLinearGradient(-22, 0, 22, 0);
      bodyGrad.addColorStop(0, "#D97706");
      bodyGrad.addColorStop(0.3, "#F59E0B");
      bodyGrad.addColorStop(0.7, "#FBBF24");
      bodyGrad.addColorStop(1, "#B45309");

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 12, 22, 32, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#78350F";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Carbon Fiber / Titanium Armor Stripes
      ctx.fillStyle = "#1E293B";
      ctx.fillRect(-20, 2, 40, 7);
      ctx.fillRect(-18, 16, 36, 7);
      ctx.fillRect(-14, 29, 28, 6);

      // Stinger Metal Needle
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.moveTo(-4, 42);
      ctx.lineTo(4, 42);
      ctx.lineTo(0, 54);
      ctx.closePath();
      ctx.fill();

      // ── 4. CHROME ROBOT HEAD & GLOWING LED VISOR ──
      const headGrad = ctx.createRadialGradient(-4, -26, 2, 0, -24, 18);
      headGrad.addColorStop(0, "#FFFFFF");
      headGrad.addColorStop(0.4, "#94A3B8");
      headGrad.addColorStop(1, "#1E293B");

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -22, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Cyber Glowing LED Visor (Cyan/Teal)
      ctx.fillStyle = "#06B6D4";
      ctx.shadowColor = "#22D3EE";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, -23, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow

      // Visor Eye Glow Reflection
      ctx.fillStyle = "#E0F2FE";
      ctx.beginPath();
      ctx.arc(-4, -24, 2.5, 0, Math.PI * 2);
      ctx.arc(4, -24, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Robot Antennae with Glowing Tips
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;

      // Left Antenna
      ctx.beginPath();
      ctx.moveTo(-6, -38);
      ctx.lineTo(-14, -50);
      ctx.stroke();

      ctx.fillStyle = "#14B8A6";
      ctx.shadowColor = "#14B8A6";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(-14, -50, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Right Antenna
      ctx.beginPath();
      ctx.moveTo(6, -38);
      ctx.lineTo(14, -50);
      ctx.stroke();

      ctx.fillStyle = "#14B8A6";
      ctx.shadowColor = "#14B8A6";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(14, -50, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [isReducedMotion, updatePhysics]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none"
      aria-hidden="true"
    />
  );
}
