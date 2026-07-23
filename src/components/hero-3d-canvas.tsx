import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  alpha: number;
}

export function Hero3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const isDark = document.documentElement.classList.contains("dark");

    // 3D Nodes generation
    const nodeCount = 38;
    const nodes: Node3D[] = [];
    const radius = Math.min(width, height) * 0.35;

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        size: Math.random() * 2.5 + 1.5,
        alpha: Math.random() * 0.5 + 0.4,
      });
    }

    let angleX = 0.002;
    let angleY = 0.003;
    let targetAngleX = 0.002;
    let targetAngleY = 0.003;

    // Mouse interactive 3D parallax
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / width - 0.5;
      const mouseY = (e.clientY - rect.top) / height - 0.5;
      targetAngleX = mouseY * 0.01;
      targetAngleY = mouseX * 0.01;
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // 3D Matrix Rotation Helper
    const rotate3D = (node: Node3D, ax: number, ay: number) => {
      // Rotate Y
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      let x = node.x * cosY - node.z * sinY;
      let z = node.x * sinY + node.z * cosY;

      // Rotate X
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);
      let y = node.y * cosX - z * sinX;
      z = node.y * sinX + z * cosX;

      node.x = x;
      node.y = y;
      node.z = z;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angleX += (targetAngleX - angleX) * 0.05;
      angleY += (targetAngleY - angleY) * 0.05;

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 350;

      // Color scheme based on Deep Teal palette
      const nodeColor = isDark ? "rgba(20, 184, 166, " : "rgba(13, 110, 110, ";
      const lineColor = isDark ? "rgba(20, 184, 166, " : "rgba(13, 110, 110, ";

      // Projected nodes array
      const projected: Array<{ px: number; py: number; scale: number; alpha: number }> = [];

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        rotate3D(node, angleX, angleY);

        const scale = fov / (fov + node.z);
        const px = centerX + node.x * scale;
        const py = centerY + node.y * scale;

        projected.push({ px, py, scale, alpha: node.alpha });
      }

      // Draw 3D Connection Lines
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.25 * projected[i].scale;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.strokeStyle = `${lineColor}${lineAlpha})`;
            ctx.lineWidth = 0.8 * projected[i].scale;
            ctx.stroke();
          }
        }
      }

      // Draw 3D Nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const r = nodes[i].size * p.scale;

        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}${p.alpha * p.scale})`;
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-40 md:opacity-60 transition-opacity"
      aria-hidden="true"
    />
  );
}
