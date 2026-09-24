'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Orb, Particle, FloatingText, Segment, GameSettings, GameStats } from '@/lib/types';
import { SNAKE_THEMES, ORB_TYPES } from '@/lib/themes';
import { soundManager } from '@/lib/sound';

interface SnakeCanvasProps {
  gameState: GameState;
  settings: GameSettings;
  onGameOver: (stats: GameStats) => void;
  onScoreUpdate: (score: number, length: number, combo: number) => void;
}

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  gameState,
  settings,
  onGameOver,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game State in Refs for 60+ FPS stable loop without React re-render lag
  const stateRef = useRef({
    score: 0,
    highScore: 0,
    gemsCollected: 0,
    timeSurvivedSeconds: 0,
    startTime: 0,
    maxCombo: 1,
    combo: 1,
    comboTimer: 0, // seconds left for combo multiplier
    shake: 0,
    boostActive: false,
    boostEnergy: 100, // 0 - 100
    // Snake State
    head: { x: 400, y: 300, angle: 0, speed: 3.5, targetSpeed: 3.5 },
    segments: [] as Segment[],
    targetLength: 20,
    segmentSpacing: 8,
    tongueTimer: 0,
    tongueFlick: 0,
    // Mouse / Cursor
    mouse: { x: 400, y: 300, isInside: false, isDown: false },
    // Arena
    width: 1200,
    height: 800,
    // Items & FX
    orbs: [] as Orb[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    ambientDust: [] as Array<{ x: number; y: number; size: number; speed: number; alpha: number }>,
    lastTime: 0,
    running: false,
  });

  const animFrameIdRef = useRef<number | null>(null);

  // Spawn initial ambient dust particles
  const initDust = useCallback((width: number, height: number) => {
    const dust = [];
    for (let i = 0; i < 40; i++) {
      dust.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.8,
        speed: Math.random() * 0.3 + 0.1,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }
    stateRef.current.ambientDust = dust;
  }, []);

  // Spawn random orb with weighted probability
  const spawnOrb = useCallback((width: number, height: number, forceType?: string): Orb => {
    // Weighted choice
    const totalWeight = ORB_TYPES.reduce((acc, curr) => acc + curr.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosenType = ORB_TYPES[0];

    if (forceType) {
      chosenType = ORB_TYPES.find((t) => t.id === forceType) || ORB_TYPES[0];
    } else {
      for (const t of ORB_TYPES) {
        if (rand < t.weight) {
          chosenType = t;
          break;
        }
        rand -= t.weight;
      }
    }

    const padding = 50;
    return {
      id: Math.random(),
      x: padding + Math.random() * (width - padding * 2),
      y: padding + Math.random() * (height - padding * 2),
      type: chosenType,
      bobOffset: Math.random() * Math.PI * 2,
      pulsePhase: Math.random() * Math.PI * 2,
      radius: chosenType.radius,
    };
  }, []);

  // Reset / Initialize game
  const resetGame = useCallback(() => {
    const s = stateRef.current;
    const theme = SNAKE_THEMES.find((t) => t.id === settings.themeId) || SNAKE_THEMES[0];

    // High score from storage
    let savedHighScore = 0;
    try {
      const val = localStorage.getItem('snake_360_highscore');
      if (val) savedHighScore = parseInt(val, 10) || 0;
    } catch {}

    s.score = 0;
    s.highScore = savedHighScore;
    s.gemsCollected = 0;
    s.startTime = performance.now();
    s.timeSurvivedSeconds = 0;
    s.combo = 1;
    s.maxCombo = 1;
    s.comboTimer = 0;
    s.shake = 0;
    s.boostActive = false;
    s.boostEnergy = 100;
    s.targetLength = 22; // Start with healthy body

    const centerX = s.width / 2;
    const centerY = s.height / 2;
    s.head = {
      x: centerX,
      y: centerY,
      angle: -Math.PI / 2, // Heading up
      speed: settings.speedMode === 'chill' ? 3.0 : settings.speedMode === 'fast' ? 4.8 : 3.8,
      targetSpeed: 3.8,
    };
    s.mouse = { x: centerX, y: centerY - 120, isInside: true, isDown: false };

    // Initial segments
    s.segments = [];
    for (let i = 0; i < s.targetLength; i++) {
      const t = i / s.targetLength;
      const radius = i === 0 ? 14 : Math.max(5, 13 * (1 - t * 0.6));
      s.segments.push({
        x: centerX,
        y: centerY + i * s.segmentSpacing,
        angle: -Math.PI / 2,
        radius,
      });
    }

    // Populate initial orbs (26-32 orbs distributed)
    s.orbs = [];
    const orbCount = Math.max(24, Math.floor((s.width * s.height) / 32000));
    for (let i = 0; i < orbCount; i++) {
      s.orbs.push(spawnOrb(s.width, s.height));
    }

    s.particles = [];
    s.floatingTexts = [];
    onScoreUpdate(0, s.segments.length, 1);
  }, [settings.themeId, settings.speedMode, onScoreUpdate, spawnOrb]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      stateRef.current.width = rect.width;
      stateRef.current.height = rect.height;

      initDust(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initDust]);

  // Audio Sync with Settings
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
        soundManager.setBoosting(false);
      }
      return;
    }

    soundManager.playStart();
    resetGame();

    const canvas = canvasRef.current;
    if (!canvas) return;

    let isTerminated = false;
    let lastTs = performance.now();

    const loop = (currentTs: number) => {
      if (isTerminated) return;

      const dt = Math.min((currentTs - lastTs) / 1000, 0.1); // Max delta clamp 100ms
      lastTs = currentTs;

      const s = stateRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // --- 1. UPDATE PHYSICS & LOGIC ---
        // Survival time
        s.timeSurvivedSeconds = (currentTs - s.startTime) / 1000;

        // Combo decay
        if (s.comboTimer > 0) {
          s.comboTimer -= dt;
          if (s.comboTimer <= 0) {
            s.combo = 1;
            onScoreUpdate(s.score, s.segments.length, s.combo);
          }
        }

        // Screen Shake decay
        if (s.shake > 0) {
          s.shake = Math.max(0, s.shake - dt * 25);
        }

        // Boost logic (Space or Mouse Click)
        const isBoostPressed = s.mouse.isDown;
        if (isBoostPressed && s.boostEnergy > 0) {
          s.boostActive = true;
          s.boostEnergy = Math.max(0, s.boostEnergy - dt * 28);
          soundManager.setBoosting(true);
        } else {
          s.boostActive = false;
          s.boostEnergy = Math.min(100, s.boostEnergy + dt * 18);
          soundManager.setBoosting(false);
        }

        // Base Speed according to settings
        const baseSpeed =
          settings.speedMode === 'chill' ? 3.0 : settings.speedMode === 'fast' ? 4.8 : 3.8;
        const currentTargetSpeed = s.boostActive ? baseSpeed * 1.85 : baseSpeed;
        s.head.speed += (currentTargetSpeed - s.head.speed) * Math.min(1, dt * 10);

        // Movement Mode 1: FOLLOW (Slither / Dynamic 360-degree fluid guidance)
        // Movement Mode 2: DIRECT (Head anchored smoothly to cursor location)
        if (settings.controlMode === 'DIRECT') {
          // Direct mouse position tracking with distance constraint
          const dx = s.mouse.x - s.head.x;
          const dy = s.mouse.y - s.head.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 1) {
            s.head.angle = Math.atan2(dy, dx);
            // Move smoothly towards cursor up to maximum speed to avoid teleport self-collision
            const maxStep = s.head.speed * 60 * dt * 2.2;
            const step = Math.min(dist, maxStep);
            s.head.x += Math.cos(s.head.angle) * step;
            s.head.y += Math.sin(s.head.angle) * step;
          }
        } else {
          // Standard fluid 360-degree follow
          const dx = s.mouse.x - s.head.x;
          const dy = s.mouse.y - s.head.y;
          const distToMouse = Math.hypot(dx, dy);

          if (distToMouse > 6) {
            const targetAngle = Math.atan2(dy, dx);
            // Smooth angular turning rate
            let diff = targetAngle - s.head.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;

            // Turn agility: faster when boosting
            const turnRate = (s.boostActive ? 8.5 : 7.2) * dt;
            s.head.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnRate);
          }

          // Advance head forward in direction of facing angle
          const step = s.head.speed * 60 * dt;
          s.head.x += Math.cos(s.head.angle) * step;
          s.head.y += Math.sin(s.head.angle) * step;
        }

        // Boost emission particles
        if (s.boostActive && s.segments.length > 2 && Math.random() < 0.6) {
          const tail = s.segments[s.segments.length - 1];
          s.particles.push({
            x: tail.x + (Math.random() - 0.5) * 8,
            y: tail.y + (Math.random() - 0.5) * 8,
            vx: -Math.cos(tail.angle) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
            vy: -Math.sin(tail.angle) * (Math.random() * 2 + 1) + (Math.random() - 0.5),
            color: 'rgba(52, 211, 153, 0.7)',
            size: Math.random() * 3 + 1.5,
            life: 0,
            maxLife: 0.45,
            alpha: 0.8,
          });
        }

        // Snake Tongue Animation
        s.tongueTimer += dt;
        if (s.tongueTimer > 2.8) {
          s.tongueFlick = Math.sin((s.tongueTimer - 2.8) * Math.PI * 5);
          if (s.tongueTimer > 3.4) {
            s.tongueTimer = 0;
            s.tongueFlick = 0;
          }
        }

        // Update body segments with Inverse Kinematics / exact distance constraint
        // This ensures the body follows the exact path smoothly and never bunches up
        if (s.segments.length > 0) {
          // Head segment
          s.segments[0].x = s.head.x;
          s.segments[0].y = s.head.y;
          s.segments[0].angle = s.head.angle;
          s.segments[0].radius = 13;

          for (let i = 1; i < s.segments.length; i++) {
            const prev = s.segments[i - 1];
            const curr = s.segments[i];

            const segDx = prev.x - curr.x;
            const segDy = prev.y - curr.y;
            const segDist = Math.hypot(segDx, segDy);
            const segAngle = Math.atan2(segDy, segDx);

            curr.angle = segAngle;
            // Pull segment towards previous segment at exact spacing
            curr.x = prev.x - Math.cos(segAngle) * s.segmentSpacing;
            curr.y = prev.y - Math.sin(segAngle) * s.segmentSpacing;

            // Taper segment radius down towards the tail
            const t = i / Math.max(1, s.segments.length - 1);
            if (i < 4) {
              curr.radius = 13 - i * 0.4;
            } else {
              curr.radius = Math.max(4.5, 11.5 * (1 - t * 0.65));
            }
          }
        }

        // Gradual Snake Growth
        if (s.segments.length < s.targetLength) {
          const lastSeg = s.segments[s.segments.length - 1];
          s.segments.push({
            x: lastSeg.x,
            y: lastSeg.y,
            angle: lastSeg.angle,
            radius: 4.5,
          });
          onScoreUpdate(s.score, s.segments.length, s.combo);
        }

        // --- 2. COLLISION DETECTION ---
        const headRadius = 12;
        let collisionOccurred = false;

        // Arena boundary collision check
        const nearEdgeDist = 35;
        const isNearEdge =
          s.head.x < nearEdgeDist ||
          s.head.x > s.width - nearEdgeDist ||
          s.head.y < nearEdgeDist ||
          s.head.y > s.height - nearEdgeDist;

        if (isNearEdge && Math.random() < 0.05) {
          soundManager.playBoundaryTick();
        }

        if (
          s.head.x - headRadius <= 0 ||
          s.head.x + headRadius >= s.width ||
          s.head.y - headRadius <= 0 ||
          s.head.y + headRadius >= s.height
        ) {
          collisionOccurred = true;
        }

        // Self-collision: head against body
        // Grace threshold: Skip first 14 segments (neck area) so turning isn't lethal
        const graceSegments = 14;
        if (!collisionOccurred && s.segments.length > graceSegments) {
          for (let i = graceSegments; i < s.segments.length; i++) {
            const seg = s.segments[i];
            const distSq = (s.head.x - seg.x) ** 2 + (s.head.y - seg.y) ** 2;
            const hitThreshold = headRadius + seg.radius * 0.68;
            if (distSq < hitThreshold * hitThreshold) {
              collisionOccurred = true;
              break;
            }
          }
        }

        // Trigger Game Over
        if (collisionOccurred) {
          s.shake = settings.screenShake ? 20 : 0;
          soundManager.playDie();
          soundManager.setBoosting(false);

          // Spawn dramatic explosion particles
          for (let p = 0; p < 45; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 1.5;
            s.particles.push({
              x: s.head.x,
              y: s.head.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: p % 2 === 0 ? '#10b981' : '#f43f5e',
              size: Math.random() * 4 + 2,
              life: 0,
              maxLife: Math.random() * 0.8 + 0.4,
              alpha: 1,
            });
          }

          // Persist high score
          if (s.score > s.highScore) {
            s.highScore = s.score;
            try {
              localStorage.setItem('snake_360_highscore', s.score.toString());
            } catch {}
          }

          onGameOver({
            score: s.score,
            highScore: s.highScore,
            gemsCollected: s.gemsCollected,
            length: s.segments.length,
            timeSurvivedSeconds: Math.round(s.timeSurvivedSeconds),
            maxCombo: s.maxCombo,
          });
          return;
        }

        // --- 3. ORBS INTERACTION ---
        for (let i = s.orbs.length - 1; i >= 0; i--) {
          const orb = s.orbs[i];
          const distToHead = Math.hypot(s.head.x - orb.x, s.head.y - orb.y);

          // Magnetic attraction when very close
          if (distToHead < 42) {
            orb.x += (s.head.x - orb.x) * dt * 8;
            orb.y += (s.head.y - orb.y) * dt * 8;
          }

          // Collision with orb
          if (distToHead < headRadius + orb.radius + 3) {
            // Collected!
            s.gemsCollected++;
            // Combo increment
            s.comboTimer = 3.5; // 3.5s window to chain combos
            s.combo = Math.min(s.combo + 0.25, 5.0);
            if (s.combo > s.maxCombo) {
              s.maxCombo = Math.round(s.combo * 10) / 10;
            }

            const pointsEarned = Math.round(orb.type.points * s.combo);
            s.score += pointsEarned;
            s.targetLength += orb.type.growth;

            // Audio & visual feedback
            soundManager.playEat(Math.floor(s.combo), orb.type.rarity);

            // Floating score indicator
            s.floatingTexts.push({
              id: Math.random(),
              text: `+${pointsEarned}${s.combo > 1 ? ` (${s.combo.toFixed(1)}x)` : ''}`,
              x: orb.x,
              y: orb.y - 10,
              color: orb.type.color,
              life: 0,
              maxLife: 0.9,
              alpha: 1,
            });

            // Sparkle Particle Burst
            const particleCount = orb.type.rarity === 'epic' ? 24 : orb.type.rarity === 'rare' ? 18 : 12;
            for (let k = 0; k < particleCount; k++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpeed = Math.random() * 4 + 1;
              s.particles.push({
                x: orb.x,
                y: orb.y,
                vx: Math.cos(pAngle) * pSpeed,
                vy: Math.sin(pAngle) * pSpeed,
                color: orb.type.color,
                size: Math.random() * 3.5 + 1.5,
                life: 0,
                maxLife: Math.random() * 0.5 + 0.3,
                alpha: 1,
              });
            }

            // Remove orb and spawn new one
            s.orbs.splice(i, 1);
            s.orbs.push(spawnOrb(s.width, s.height));

            // Update parent score HUD
            onScoreUpdate(s.score, s.segments.length, s.combo);
          }
        }

        // --- 4. UPDATE PARTICLES & FLOATING TEXTS ---
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.96;
          p.vy *= 0.96;
          p.life += dt;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
          if (p.life >= p.maxLife) {
            s.particles.splice(i, 1);
          }
        }

        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y -= dt * 25;
          ft.life += dt;
          ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
          if (ft.life >= ft.maxLife) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // --- 5. RENDER CANVAS ---
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.save();
        ctx.scale(dpr, dpr);

        // Screen Shake offset
        if (s.shake > 0) {
          const shakeX = (Math.random() - 0.5) * s.shake;
          const shakeY = (Math.random() - 0.5) * s.shake;
          ctx.translate(shakeX, shakeY);
        }

        // Clear Background with Deep Cosmic Slate
        ctx.fillStyle = '#060a11';
        ctx.fillRect(0, 0, s.width, s.height);

        // Subtle Ambient Arena Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
        ctx.lineWidth = 1;
        const gridSize = 45;
        ctx.beginPath();
        for (let x = 0; x < s.width; x += gridSize) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, s.height);
        }
        for (let y = 0; y < s.height; y += gridSize) {
          ctx.moveTo(0, y);
          ctx.lineTo(s.width, y);
        }
        ctx.stroke();

        // Ambient Floating Energy Dust
        ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
        for (const dust of s.ambientDust) {
          dust.y -= dust.speed * dt * 40;
          if (dust.y < 0) {
            dust.y = s.height;
            dust.x = Math.random() * s.width;
          }
          ctx.globalAlpha = dust.alpha;
          ctx.beginPath();
          ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Arena Boundaries with Danger Zone Glow
        ctx.lineWidth = 3;
        if (isNearEdge) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
          ctx.shadowBlur = 15;
        } else {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
          ctx.shadowBlur = 8;
        }
        ctx.strokeRect(1.5, 1.5, s.width - 3, s.height - 3);
        ctx.shadowBlur = 0;

        // Render Orbs (Glowing Jewels)
        const timeSec = currentTs * 0.003;
        for (const orb of s.orbs) {
          const bob = Math.sin(timeSec * 2 + orb.bobOffset) * 2;
          const pulse = 1 + Math.sin(timeSec * 3 + orb.pulsePhase) * 0.12;
          const currentRadius = orb.radius * pulse;

          // Outer Aura
          const auraGrad = ctx.createRadialGradient(
            orb.x,
            orb.y + bob,
            currentRadius * 0.3,
            orb.x,
            orb.y + bob,
            currentRadius * 2.6
          );
          auraGrad.addColorStop(0, orb.type.glowColor);
          auraGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y + bob, currentRadius * 2.6, 0, Math.PI * 2);
          ctx.fill();

          // Main Orb Sphere
          const sphereGrad = ctx.createRadialGradient(
            orb.x - currentRadius * 0.3,
            orb.y + bob - currentRadius * 0.3,
            currentRadius * 0.1,
            orb.x,
            orb.y + bob,
            currentRadius
          );
          sphereGrad.addColorStop(0, orb.type.innerColor);
          sphereGrad.addColorStop(0.6, orb.type.color);
          sphereGrad.addColorStop(1, '#022c22');

          ctx.fillStyle = sphereGrad;
          ctx.beginPath();
          ctx.arc(orb.x, orb.y + bob, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          // Specular Glint
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(
            orb.x - currentRadius * 0.35,
            orb.y + bob - currentRadius * 0.35,
            currentRadius * 0.28,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        // Render Particles
        for (const p of s.particles) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Render Snake
        const currentTheme =
          SNAKE_THEMES.find((t) => t.id === settings.themeId) || SNAKE_THEMES[0];

        // Draw Continuous Body (Backwards from tail to neck for proper scale overlapping)
        if (s.segments.length > 1) {
          for (let i = s.segments.length - 1; i >= 1; i--) {
            const seg = s.segments[i];
            const t = i / s.segments.length;

            // Outer Vertebra Glow
            if (i % 3 === 0) {
              ctx.shadowColor = currentTheme.headGlow;
              ctx.shadowBlur = 6;
            } else {
              ctx.shadowBlur = 0;
            }

            // Segment Circle
            const segGrad = ctx.createRadialGradient(
              seg.x - Math.cos(seg.angle) * 2,
              seg.y - Math.sin(seg.angle) * 2,
              seg.radius * 0.2,
              seg.x,
              seg.y,
              seg.radius
            );
            segGrad.addColorStop(0, currentTheme.bodyGradientStart);
            segGrad.addColorStop(0.7, currentTheme.bodyGradientEnd);
            segGrad.addColorStop(1, currentTheme.outlineColor);

            ctx.fillStyle = segGrad;
            ctx.beginPath();
            ctx.arc(seg.x, seg.y, seg.radius, 0, Math.PI * 2);
            ctx.fill();

            // Dorsal Pattern / Scale highlight
            if (i % 2 === 0 && seg.radius > 6) {
              ctx.fillStyle = currentTheme.bellyColor;
              ctx.globalAlpha = 0.55;
              ctx.beginPath();
              ctx.arc(seg.x, seg.y, seg.radius * 0.38, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;
            }
          }
          ctx.shadowBlur = 0;
        }

        // Render Head & Tongue
        const headSeg = s.segments[0] || { x: s.head.x, y: s.head.y, angle: s.head.angle, radius: 13 };
        ctx.save();
        ctx.translate(headSeg.x, headSeg.y);
        ctx.rotate(headSeg.angle);

        // Flicking Tongue (in front of head)
        if (s.tongueFlick > 0) {
          const tLen = 14 + s.tongueFlick * 12;
          ctx.strokeStyle = currentTheme.tongueColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(12, 0);
          ctx.lineTo(12 + tLen, 0);
          // Forked tips
          ctx.lineTo(12 + tLen + 5, -4);
          ctx.moveTo(12 + tLen, 0);
          ctx.lineTo(12 + tLen + 5, 4);
          ctx.stroke();
        }

        // Head Base Teardrop / Dome Shape
        ctx.shadowColor = currentTheme.headGlow;
        ctx.shadowBlur = 12;

        const headGrad = ctx.createRadialGradient(2, 0, 2, 0, 0, 15);
        headGrad.addColorStop(0, currentTheme.headColor);
        headGrad.addColorStop(0.8, currentTheme.bodyGradientEnd);
        headGrad.addColorStop(1, currentTheme.outlineColor);

        ctx.fillStyle = headGrad;
        ctx.beginPath();
        // Custom aerodynamic snake skull
        ctx.ellipse(2, 0, 14, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = currentTheme.outlineColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Nostril pits
        ctx.fillStyle = currentTheme.outlineColor;
        ctx.beginPath();
        ctx.arc(11, -3, 1.2, 0, Math.PI * 2);
        ctx.arc(11, 3, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Responsive Living Eyes (pointing forward, tracking movement & nearby orbs)
        const eyeOffset = 6.5;
        const eyeRadius = 4.2;
        const eyeX = 4;

        [-1, 1].forEach((side) => {
          const ey = side * eyeOffset;

          // Sclera (White outer)
          ctx.fillStyle = currentTheme.eyeSclera;
          ctx.beginPath();
          ctx.arc(eyeX, ey, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = currentTheme.outlineColor;
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Iris (Theme accent)
          ctx.fillStyle = currentTheme.eyeIris;
          ctx.beginPath();
          ctx.arc(eyeX + 1.2, ey, eyeRadius * 0.65, 0, Math.PI * 2);
          ctx.fill();

          // Pupil (Slit / dot looking ahead)
          ctx.fillStyle = currentTheme.eyePupil;
          ctx.beginPath();
          ctx.ellipse(eyeX + 1.5, ey, 1.2, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Eye specular gleam
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(eyeX + 0.4, ey - 1.2, 0.9, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();

        // Render Floating Text Multipliers
        for (const ft of s.floatingTexts) {
          ctx.globalAlpha = ft.alpha;
          ctx.font = '600 13px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = ft.color;
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(ft.text, ft.x - 12, ft.y);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;

        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      isTerminated = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      soundManager.setBoosting(false);
    };
  }, [gameState, settings, onGameOver, onScoreUpdate, resetGame, spawnOrb]);

  // Pointer Event Handlers for 360° Mouse / Touch Navigation
  const updatePointerPosition = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(10, Math.min(rect.width - 10, clientX - rect.left));
    const y = Math.max(10, Math.min(rect.height - 10, clientY - rect.top));

    stateRef.current.mouse.x = x;
    stateRef.current.mouse.y = y;
    stateRef.current.mouse.isInside = true;
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updatePointerPosition(e.clientX, e.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      stateRef.current.mouse.isDown = true;
    }
  };

  const handleMouseUp = () => {
    stateRef.current.mouse.isDown = false;
  };

  // Touch support for tablets & mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
      stateRef.current.mouse.isDown = true;
    }
  };

  const handleTouchEnd = () => {
    stateRef.current.mouse.isDown = false;
  };

  // Keyboard shortcut listener (Spacebar for turbo boost)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stateRef.current.mouse.isDown = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stateRef.current.mouse.isDown = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none cursor-crosshair">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full block bg-[#060a11] rounded-xl shadow-2xl border border-slate-800/80 overflow-hidden"
      />
    </div>
  );
};
