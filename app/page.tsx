"use client";

import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";
import { Route, Menu, X } from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });
const client = generateClient<Schema>();

// Optimized Particle Animation Component
const ParticleAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    originalX: number;
    originalY: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Optimize canvas settings
    ctx.imageSmoothingEnabled = false;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Unified settings for both mobile and desktop
    const particleCount = 70;
    const connectionDistance = 90;
    const mouseInfluence = 70;

    // Initialize particles once
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          originalX: x,
          originalY: y,
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime < frameInterval) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      
      // Update and draw particles in single loop
      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseInfluence && distance > 0) {
          const force = (mouseInfluence - distance) / mouseInfluence;
          particle.vx += (dx / distance) * force * 0.2;
          particle.vy += (dy / distance) * force * 0.2;
        }

        // Return to original position
        particle.vx += (particle.originalX - particle.x) * 0.005;
        particle.vy += (particle.originalY - particle.y) * 0.005;

        // Apply velocity and friction
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Boundary checks
        if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -0.8;
        if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -0.8;

        // Draw connections (optimized - only check forward particles)
        for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
          const other = particles[j];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.2;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    />
  );
};

export default function Home() {
  const words = [
    'Payroll',
    'Enterprise agreement',
    'Award interpretation',
    'Time attendance',
    'Rostering',
    'Compliance',
    'Workforce analytics',
  ];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const tickerCycle = () => {
      // Wait 4 seconds with text visible
      setTimeout(() => {
        setIsAnimating(true);
        
        // After 1 second of animation, change to next word
        setTimeout(() => {
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          
          // Complete animation after another 1 second
          setTimeout(() => {
            setIsAnimating(false);
          }, 1000);
        }, 1000);
      }, 4000);
    };

    // Start the cycle
    const interval = setInterval(tickerCycle, 6000); // Total cycle: 6 seconds
    
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <div className={`${spaceGrotesk.className} text-gray-900 relative flex-1 flex flex-col justify-center items-center overflow-hidden`}>
      <ParticleAnimation />
      
      <main className="relative z-10 flex flex-col items-center px-[5px] md:px-0">
        <section className="hero mb-8 px-8 md:px-0">
          <div className="flex flex-col items-center justify-center gap-4 text-lg text-center">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg px-6 py-4 shadow-lg border border-white/30 mx-4 md:mx-0">
              <p className="flex items-center justify-center gap-2">
                <span className="fluo-ticker relative inline-block overflow-hidden min-w-[200px] h-10 bg-gray-100 rounded px-2 py-2 border">
                  <span 
                    className={`absolute left-0 top-2 w-full text-center transition-all duration-1000 ease-in-out text-gray-800 font-medium ${
                      isAnimating ? 'transform translate-y-[-100%] opacity-0' : 'transform translate-y-0 opacity-100'
                    }`}
                  >
                    {words[currentWordIndex]}
                  </span>
                  <span 
                    className={`absolute left-0 top-2 w-full text-center transition-all duration-1000 ease-in-out text-gray-800 font-medium ${
                      isAnimating ? 'transform translate-y-0 opacity-100' : 'transform translate-y-[100%] opacity-0'
                    }`}
                  >
                    {words[(currentWordIndex + 1) % words.length]}
                  </span>
                </span>
                <span>is <span className="line-through">complex</span>; complicated.</span>
              </p>
            </div>
          </div>
        </section>
        
        <section className="features px-[5px] md:px-0">
          <div className="flex justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20 w-full md:w-auto">
              <table className="table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">Word</th>
                    <th className="border border-gray-300 px-4 py-2">Solvability</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Complicated</td>
                    <td className="border border-gray-300 px-4 py-2">
                      Can be solved — messy but fixable
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2">Complex</td>
                    <td className="border border-gray-300 px-4 py-2">
                      Harder to solve — deep, layered, and is dynamic and inherently
                      uncertain.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}