import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Subtle low-contrast shader background with fluid mouse interaction
const LiquidBackground: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state) => {
    const { clock, mouse } = state;
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = clock.getElapsedTime();
      mat.uniforms.uMouse.value.lerp(mouse, 0.04);
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec2 uMouse;
          varying vec2 vUv;
          void main() {
            vec2 uv = vUv;
            float t = uTime * 0.12;
            vec2 m = uMouse * 0.08;
            float wave = sin(uv.x * 6.0 + t + m.x * 10.0) + sin(uv.y * 5.0 - t + m.y * 10.0);
            float color = smoothstep(0.0, 1.0, wave * 0.5 + 0.5);
            gl_FragColor = vec4(mix(vec3(0.003), vec3(0.038), color), 1.0);
          }
        `}
      />
    </mesh>
  );
};

// Dark, subtly reflective irregular monolith floating behind typography
const Monolith: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.18;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.12) * 0.08;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[6, -1, 0]}>
        <icosahedronGeometry args={[14, 1]} />
        <MeshDistortMaterial
          color="#080808"
          speed={2.2}
          distort={0.32}
          roughness={0.12}
          metalness={0.92}
        />
      </mesh>
    </Float>
  );
};

// WebGL Fallback Boundary
class WebGLBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#050505] to-[#010101]" />
      );
    }
    return this.props.children;
  }
}

export const ExperienceHero: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebGLSupported(false);
    } catch {
      setWebGLSupported(false);
    }
  }, []);

  // GSAP Cinematic Entrance Sequence & Magnetic CTA
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Immediate presentation for reduced motion
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Reveal small brand label
      if (brandRef.current) {
        gsap.fromTo(
          brandRef.current,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
        );
      }

      // 2. Reveal headline with cinematic blur-to-sharp transition
      if (headlineRef.current) {
        gsap.fromTo(
          headlineRef.current,
          { filter: 'blur(24px)', opacity: 0, scale: 1.02 },
          { filter: 'blur(0px)', opacity: 1, scale: 1, duration: 2.2, ease: 'expo.out', delay: 0.4 }
        );
      }

      // 3. Reveal supporting description
      if (descRef.current) {
        gsap.fromTo(
          descRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', delay: 0.9 }
        );
      }

      // 4. Reveal primary CTA
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 1.2 }
        );
      }

      // Magnetic hover interaction on CTA button
      const handleMouseMove = (e: MouseEvent) => {
        if (!ctaRef.current) return;
        const rect = ctaRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        if (dist < 130) {
          gsap.to(ctaRef.current, {
            x: (e.clientX - centerX) * 0.35,
            y: (e.clientY - centerY) * 0.35,
            duration: 0.5,
            ease: 'power2.out',
          });
        } else {
          gsap.to(ctaRef.current, {
            x: 0,
            y: 0,
            duration: 0.7,
            ease: 'elastic.out(1, 0.35)',
          });
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleExploreClick = () => {
    navigate('/overview');
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#020202] text-white flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-20 overflow-hidden selection:bg-white selection:text-black select-none"
      aria-label="SME Retention Intelligence Hero"
    >
      {/* 3D WebGL Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {webGLSupported ? (
          <WebGLBoundary>
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [0, 0, 52], fov: 35 }}
              gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[30, 40, 40]} intensity={2.4} />
              <pointLight position={[-20, -20, 20]} intensity={0.6} />
              <LiquidBackground />
              <Monolith />
            </Canvas>
          </WebGLBoundary>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#020202] via-[#060606] to-[#010101]" />
        )}
      </div>

      {/* Top Left Brand Indicator */}
      <header className="relative z-10 w-full flex items-center justify-between">
        <div ref={brandRef} className="flex items-center gap-3">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-[0.25em] text-white/90 uppercase">
            SME RETENTION INTELLIGENCE
          </span>
        </div>
      </header>

      {/* Center Dominant Headline & Supporting Summary */}
      <main className="relative z-10 w-full my-auto py-12 md:py-8 flex flex-col justify-center">
        <div className="max-w-6xl">
          <h1
            ref={headlineRef}
            className="text-[clamp(3.5rem,10.2vw,11.5rem)] font-black leading-[0.88] tracking-tighter uppercase"
          >
            <span className="text-white block">RETENTION</span>
            <span className="text-outline block mt-1">INTELLIGENCE</span>
          </h1>

          <p
            ref={descRef}
            className="mt-8 font-mono text-[11px] sm:text-xs text-white/50 uppercase tracking-[0.3em] max-w-xl leading-relaxed"
          >
            Predict SME churn. Quantify charge volume at risk. Prioritize retention decisions with evidence.
          </p>
        </div>
      </main>

      {/* Bottom Left Primary CTA Action */}
      <footer className="relative z-10 w-full flex items-center justify-between">
        <button
          ref={ctaRef}
          onClick={handleExploreClick}
          className="group flex items-center gap-5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4 focus-visible:ring-offset-black rounded-full"
          aria-label="Explore the Project Analytics Application"
        >
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500 overflow-hidden shadow-lg shadow-black/60">
            {/* Crisp Diagonal Arrow Icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-white group-hover:stroke-black transition-colors duration-500"
              aria-hidden="true"
            >
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-mono text-[11px] sm:text-xs font-bold text-white tracking-[0.22em] uppercase group-hover:text-white/80 transition-colors">
            EXPLORE THE PROJECT
          </span>
        </button>
      </footer>
    </section>
  );
};

export default ExperienceHero;
