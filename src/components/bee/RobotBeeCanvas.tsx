import { useEffect, useRef } from "react";
import { useBeeController } from "./useBeeController";
import { BEE_CONFIG } from "./config";

interface RealBeeCanvasProps {
  isReducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

interface FloatingBadge {
  x: number;
  y: number;
  text: string;
  alpha: number;
}

export function RobotBeeCanvas({ isReducedMotion }: RealBeeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { updatePhysics } = useBeeController({ isReducedMotion });

  // Reaction State Tracking
  const reactionTimerRef = useRef<number>(0);
  const reactionSpinRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const badgeRef = useRef<FloatingBadge | null>(null);
  const beeScreenPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

    // Touch & Click Detection on Bee
    const handlePointerDown = (e: PointerEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      const beeX = beeScreenPosRef.current.x;
      const beeY = beeScreenPosRef.current.y;

      const dist = Math.hypot(clickX - beeX, clickY - beeY);

      // Touch radius threshold (80px around bee)
      if (dist < 85) {
        // Trigger Touch Reaction!
        reactionTimerRef.current = 1.0; // 1 second active reaction
        if (typeof window !== "undefined" && navigator.vibrate) {
          navigator.vibrate([40, 60, 40]);
        }

        // Spawn Pollen Sparkle Particles
        const colors = ["#FBBF24", "#F59E0B", "#FDE047", "#10B981", "#38BDF8"];
        const newParticles: Particle[] = [];
        for (let i = 0; i < 18; i++) {
          const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.5;
          const speed = Math.random() * 4 + 2;
          newParticles.push({
            x: beeX,
            y: beeY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            size: Math.random() * 4 + 2,
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
        particlesRef.current = newParticles;

        // Spawn Floating Heart/Sparkle Badge
        const badges = ["🐝✨", "💛", "✨", "🍯", "⚡"];
        badgeRef.current = {
          x: beeX,
          y: beeY - 30,
          text: badges[Math.floor(Math.random() * badges.length)],
          alpha: 1,
        };
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    let lastTime = performance.now();

    const render = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      const clockTime = now / 1000;

      ctx.clearRect(0, 0, width, height);

      // Get physics & motion state
      const { position, rotation, isMobile } = updatePhysics(delta, clockTime);

      const isDark = document.documentElement.classList.contains("dark");
      const scaleBase = isMobile ? BEE_CONFIG.beeScaleMobile : BEE_CONFIG.beeScaleDesktop;
      const responsiveFactor = isMobile ? Math.max(0.9, width / 420) : width / 1200;
      const scaleMultiplier = scaleBase * responsiveFactor;

      // Convert world position ([-3, 3]) to canvas screen coordinates
      let centerX = width / 2 + position[0] * (width / (isMobile ? 4.5 : 6));
      let centerY = height / 2 - position[1] * (height / (isMobile ? 3.5 : 4));

      // Handle Active Touch Reaction Animations
      let reactionBounceY = 0;
      let reactionFlapMultiplier = 1;

      if (reactionTimerRef.current > 0) {
        reactionTimerRef.current -= delta;
        reactionSpinRef.current += delta * 12; // Happy 360 spin
        reactionBounceY = Math.sin((1 - reactionTimerRef.current) * Math.PI) * -35;
        reactionFlapMultiplier = 2.5; // Double wing speed
      } else {
        reactionSpinRef.current = 0;
      }

      centerY += reactionBounceY;
      beeScreenPosRef.current = { x: centerX, y: centerY };

      const roll = rotation[2];

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scaleMultiplier, scaleMultiplier);
      ctx.rotate(roll * 0.4 + reactionSpinRef.current);

      // ── 1. NATURAL HONEY GLOW AURA ──
      const honeyGlow = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
      honeyGlow.addColorStop(0, "rgba(251, 191, 36, 0.4)");
      honeyGlow.addColorStop(0.6, "rgba(245, 158, 11, 0.15)");
      honeyGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = honeyGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 45, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. REALISTIC TRANSLUCENT HONEYBEE WINGS (Natural Flapping) ──
      const flapAngle = isReducedMotion
        ? 0.2
        : Math.sin(clockTime * BEE_CONFIG.flapSpeed * reactionFlapMultiplier) *
          BEE_CONFIG.flapAmplitude;

      // Left Front & Hind Wings
      ctx.save();
      ctx.translate(-12, -8);
      ctx.rotate(-0.35 - flapAngle);
      const leftWingGrad = ctx.createLinearGradient(-35, -35, 0, 0);
      leftWingGrad.addColorStop(0, "rgba(254, 243, 199, 0.85)");
      leftWingGrad.addColorStop(0.6, "rgba(251, 191, 36, 0.45)");
      leftWingGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");

      ctx.fillStyle = leftWingGrad;
      ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.7)" : "rgba(180, 83, 9, 0.6)";
      ctx.lineWidth = 1.4;

      // Front Wing
      ctx.beginPath();
      ctx.ellipse(-26, -26, 32, 13, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wing Vein Lines
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(-38, -34);
      ctx.moveTo(-18, -18);
      ctx.lineTo(-30, -38);
      ctx.strokeStyle = "rgba(180, 83, 9, 0.4)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();

      // Right Front & Hind Wings
      ctx.save();
      ctx.translate(12, -8);
      ctx.rotate(0.35 + flapAngle);
      const rightWingGrad = ctx.createLinearGradient(35, -35, 0, 0);
      rightWingGrad.addColorStop(0, "rgba(254, 243, 199, 0.85)");
      rightWingGrad.addColorStop(0.6, "rgba(251, 191, 36, 0.45)");
      rightWingGrad.addColorStop(1, "rgba(255, 255, 255, 0.2)");

      ctx.fillStyle = rightWingGrad;
      ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.7)" : "rgba(180, 83, 9, 0.6)";
      ctx.lineWidth = 1.4;

      // Front Wing
      ctx.beginPath();
      ctx.ellipse(26, -26, 32, 13, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wing Vein Lines
      ctx.beginPath();
      ctx.moveTo(10, -10);
      ctx.lineTo(38, -34);
      ctx.moveTo(18, -18);
      ctx.lineTo(30, -38);
      ctx.strokeStyle = "rgba(180, 83, 9, 0.4)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
      ctx.restore();

      // ── 3. ORGANIC HONEYBEE ABDOMEN (Natural Fluffy Golden Stripes) ──
      const bodyGrad = ctx.createLinearGradient(-24, 0, 24, 0);
      bodyGrad.addColorStop(0, "#D97706");
      bodyGrad.addColorStop(0.2, "#F59E0B");
      bodyGrad.addColorStop(0.5, "#FBBF24");
      bodyGrad.addColorStop(0.8, "#F59E0B");
      bodyGrad.addColorStop(1, "#B45309");

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(0, 14, 23, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#78350F";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Fluffy Black Stripes
      ctx.fillStyle = "#271C19";
      ctx.beginPath();
      ctx.ellipse(0, 4, 22.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 18, 20.5, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 31, 15.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Organic Soft Fur Texture Dots
      ctx.fillStyle = "#FDE047";
      for (let i = -16; i <= 16; i += 8) {
        ctx.beginPath();
        ctx.arc(i, 11, 1.2, 0, Math.PI * 2);
        ctx.arc(i + 4, 25, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Natural Stinger Tip
      ctx.fillStyle = "#1E1B18";
      ctx.beginPath();
      ctx.moveTo(-3.5, 44);
      ctx.lineTo(3.5, 44);
      ctx.lineTo(0, 55);
      ctx.closePath();
      ctx.fill();

      // ── 4. FUZZY THORAX & CUTE COMPOUND EYES ──
      // Thorax
      const thoraxGrad = ctx.createRadialGradient(0, -10, 2, 0, -10, 18);
      thoraxGrad.addColorStop(0, "#F59E0B");
      thoraxGrad.addColorStop(0.6, "#D97706");
      thoraxGrad.addColorStop(1, "#451A03");

      ctx.fillStyle = thoraxGrad;
      ctx.beginPath();
      ctx.arc(0, -10, 17, 0, Math.PI * 2);
      ctx.fill();

      // Head
      const headGrad = ctx.createRadialGradient(-3, -25, 2, 0, -23, 16);
      headGrad.addColorStop(0, "#78350F");
      headGrad.addColorStop(0.7, "#291603");
      headGrad.addColorStop(1, "#0F172A");

      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(0, -23, 15, 0, Math.PI * 2);
      ctx.fill();

      // Cute Big Organic Compound Eyes
      ctx.fillStyle = "#090D16";
      ctx.beginPath();
      ctx.ellipse(-8, -25, 5.5, 7.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(8, -25, 5.5, 7.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Eye White Specular Reflection Spots
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(-9.5, -27, 2, 0, Math.PI * 2);
      ctx.arc(6.5, -27, 2, 0, Math.PI * 2);
      ctx.fill();

      // Natural Curved Antennae
      ctx.strokeStyle = "#291603";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";

      // Left Antenna
      ctx.beginPath();
      ctx.moveTo(-5, -34);
      ctx.quadraticCurveTo(-14, -44, -18, -48);
      ctx.stroke();

      ctx.fillStyle = "#D97706";
      ctx.beginPath();
      ctx.arc(-18, -48, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Right Antenna
      ctx.beginPath();
      ctx.moveTo(5, -34);
      ctx.quadraticCurveTo(14, -44, 18, -48);
      ctx.stroke();

      ctx.fillStyle = "#D97706";
      ctx.beginPath();
      ctx.arc(18, -48, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ── 5. POLLEN SPARKLE PARTICLES BURST ──
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= delta * 1.2;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // ── 6. FLOATING EMOJI BADGE REACTION ──
      const badge = badgeRef.current;
      if (badge) {
        badge.y -= delta * 30;
        badge.alpha -= delta * 1.1;

        if (badge.alpha <= 0) {
          badgeRef.current = null;
        } else {
          ctx.save();
          ctx.font = "bold 22px system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.globalAlpha = Math.max(0, badge.alpha);
          ctx.fillText(badge.text, badge.x, badge.y);
          ctx.restore();
        }
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isReducedMotion, updatePhysics]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none cursor-pointer"
      aria-hidden="true"
    />
  );
}
