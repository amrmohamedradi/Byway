import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface BookProps {
  reducedMotion: boolean;
}

const ProceduralBook: React.FC<BookProps> = ({ reducedMotion }) => {
  const bookGroupRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  const coverWidth = 1.35;
  const coverHeight = 2.5;
  const coverThickness = 0.06;

  const pageWidth = 1.25;
  const pageHeight = 2.4;
  const pageThickness = 0.03;

  const openAngle = 0.25;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (glowLightRef.current) {
      glowLightRef.current.intensity = 2.5 + Math.sin(t * 2) * 0.8;
    }

    if (bookGroupRef.current && !reducedMotion) {
      bookGroupRef.current.rotation.z = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group ref={bookGroupRef} rotation={[-0.3, 0.5, 0]}>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.08, 0.06, coverHeight]} />
        <meshStandardMaterial
          color="#d97706"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <group rotation={[0, 0, openAngle]}>
        <mesh position={[-coverWidth / 2, -coverThickness / 2, 0]}>
          <boxGeometry args={[coverWidth, coverThickness, coverHeight]} />
          <meshStandardMaterial
            color="#1e3a8a"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        <mesh position={[-pageWidth / 2, pageThickness / 2, 0]}>
          <boxGeometry args={[pageWidth, pageThickness, pageHeight]} />
          <meshStandardMaterial
            color="#fefce8"
            roughness={0.7}
          />
        </mesh>

        <group rotation={[0, 0, 0.04]} position={[0, pageThickness, 0]}>
          <mesh position={[-pageWidth / 2, pageThickness / 2, 0]}>
            <boxGeometry args={[pageWidth * 0.97, pageThickness, pageHeight * 0.98]} />
            <meshStandardMaterial
              color="#fefce8"
              roughness={0.7}
            />
          </mesh>
        </group>

        <group rotation={[0, 0, 0.08]} position={[0, pageThickness * 2, 0]}>
          <mesh position={[-pageWidth / 2, pageThickness / 2, 0]}>
            <boxGeometry args={[pageWidth * 0.94, pageThickness, pageHeight * 0.96]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.8}
            />
          </mesh>
        </group>
      </group>

      <group rotation={[0, 0, -openAngle]}>
        <mesh position={[coverWidth / 2, -coverThickness / 2, 0]}>
          <boxGeometry args={[coverWidth, coverThickness, coverHeight]} />
          <meshStandardMaterial
            color="#1e3a8a"
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        <mesh position={[pageWidth / 2, pageThickness / 2, 0]}>
          <boxGeometry args={[pageWidth, pageThickness, pageHeight]} />
          <meshStandardMaterial
            color="#fefce8"
            roughness={0.7}
          />
        </mesh>

        <group rotation={[0, 0, -0.04]} position={[0, pageThickness, 0]}>
          <mesh position={[pageWidth / 2, pageThickness / 2, 0]}>
            <boxGeometry args={[pageWidth * 0.97, pageThickness, pageHeight * 0.98]} />
            <meshStandardMaterial
              color="#fefce8"
              roughness={0.7}
            />
          </mesh>
        </group>

        <group rotation={[0, 0, -0.08]} position={[0, pageThickness * 2, 0]}>
          <mesh position={[pageWidth / 2, pageThickness / 2, 0]}>
            <boxGeometry args={[pageWidth * 0.94, pageThickness, pageHeight * 0.96]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.8}
            />
          </mesh>
        </group>
      </group>

      <mesh position={[0, pageThickness * 2.1, -0.15]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.12, 0.02, coverHeight * 1.05]} />
        <meshStandardMaterial
          color="#be123c"
          roughness={0.3}
        />
      </mesh>

      <pointLight
        ref={glowLightRef}
        position={[0, 0.25, 0]}
        color="#fbbf24"
        intensity={3.0}
        distance={4.5}
        decay={2}
      />
    </group>
  );
};

export const HeroBookParticles: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    window.addEventListener('resize', handleResize);
    mediaQuery.addEventListener('change', handleMotionChange);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const sparklesCount = isMobile ? 25 : 65;

  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[450px] relative select-none">
      <Canvas
        camera={{ position: [0, 0.5, 4.2], fov: 50 }}
        dpr={isMobile ? 1 : [1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} color="#e2e8f0" />
        <directionalLight position={[3, 8, 4]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-4, -2, -3]} intensity={0.6} color="#6366f1" />

        <Float
          speed={reducedMotion ? 0 : 1.8}
          rotationIntensity={0.3}
          floatIntensity={0.6}
          floatingRange={[-0.15, 0.15]}
        >
          <ProceduralBook reducedMotion={reducedMotion} />
        </Float>

        {!reducedMotion && (
          <Sparkles
            count={sparklesCount}
            scale={[3.2, 2.5, 2.8]}
            position={[0, 0.6, 0]}
            size={isMobile ? 2.0 : 3.5}
            speed={0.4}
            color="#fbbf24"
          />
        )}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.22}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>
    </div>
  );
};

export default HeroBookParticles;
