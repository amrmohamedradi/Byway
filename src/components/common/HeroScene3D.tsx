import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

// ─── Individual Constellation Node ───────────────────────────────────────────
interface NodeProps {
  position: [number, number, number];
  color: string;
  size: number;
}

const ConstellationNode: React.FC<NodeProps> = ({ position, color, size }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transmission={0.6}
        thickness={0.5}
        ior={1.5}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// ─── Constellation Connections & Nodes Group ─────────────────────────────────
interface NetworkProps {
  nodeCount: number;
  connectionDistance: number;
  reducedMotion: boolean;
}

const ConstellationNetwork: React.FC<NetworkProps> = ({
  nodeCount,
  connectionDistance,
  reducedMotion,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate random stable positions & colors for the nodes
  const { nodes, connections } = useMemo(() => {
    const tempNodes: Array<{ pos: [number, number, number]; color: string; size: number }> = [];
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#6366f1', '#f59e0b'];

    for (let i = 0; i < nodeCount; i++) {
      const pos: [number, number, number] = [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 5,
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 0.05 + Math.random() * 0.08;
      tempNodes.push({ pos, color, size });
    }

    // Determine close nodes to form line connections
    const tempConnections: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    for (let i = 0; i < tempNodes.length; i++) {
      for (let j = i + 1; j < tempNodes.length; j++) {
        const p1 = tempNodes[i].pos;
        const p2 = tempNodes[j].pos;
        const dx = p1[0] - p2[0];
        const dy = p1[1] - p2[1];
        const dz = p1[2] - p2[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
          tempConnections.push({ start: p1, end: p2 });
        }
      }
    }

    return { nodes: tempNodes, connections: tempConnections };
  }, [nodeCount, connectionDistance]);

  // Gentle continuous rotation if reduced motion is disabled
  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.05;
    groupRef.current.rotation.x = Math.sin(t * 0.03) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Nodes */}
      {nodes.map((node, idx) => (
        <ConstellationNode
          key={idx}
          position={node.pos}
          color={node.color}
          size={node.size}
        />
      ))}

      {/* Connection Lines */}
      {connections.map((conn, idx) => (
        <Line
          key={idx}
          points={[conn.start, conn.end]}
          color="#94a3b8" // slate-400
          lineWidth={0.5}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  );
};

// ─── Floating Educational Icons/Shapes ───────────────────────────────────────
const FloatingSubjectGeometries: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  return (
    <group>
      {/* 1. Code / Logic (Torus/Ring) */}
      <Float speed={reducedMotion ? 0 : 2} rotationIntensity={0.5} floatIntensity={1} position={[-2, 1.5, 0]}>
        <mesh>
          <torusGeometry args={[0.3, 0.08, 12, 48]} />
          <meshPhysicalMaterial
            color="#8b5cf6" // violet-500
            roughness={0.1}
            transmission={0.6}
            thickness={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* 2. Math / Growth (Cone/Pyramid) */}
      <Float speed={reducedMotion ? 0 : 1.5} rotationIntensity={0.8} floatIntensity={1.2} position={[2, -1, 1]}>
        <mesh rotation={[0.4, 0.2, 0.1]}>
          <coneGeometry args={[0.35, 0.7, 4]} />
          <meshPhysicalMaterial
            color="#3b82f6" // blue-500
            roughness={0.1}
            transmission={0.6}
            thickness={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* 3. Science / Nodes (Octahedron) */}
      <Float speed={reducedMotion ? 0 : 1.8} rotationIntensity={0.6} floatIntensity={0.8} position={[-1.5, -1.8, 0.5]}>
        <mesh>
          <octahedronGeometry args={[0.35]} />
          <meshPhysicalMaterial
            color="#10b981" // emerald-500
            roughness={0.1}
            transmission={0.6}
            thickness={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>
    </group>
  );
};

// ─── Core Canvas Scene ────────────────────────────────────────────────────────
export const HeroScene3D: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check screen width & prefers-reduced-motion queries
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

  // Performance parameters based on mobile vs desktop
  const nodeCount = isMobile ? 18 : 35;
  const connectionDistance = isMobile ? 1.8 : 2.2;
  const sparkleCount = isMobile ? 0 : 45; // Disable heavy sparkles on mobile for rendering speeds

  return (
    <div className="w-full h-full min-h-[300px] sm:min-h-[450px] relative select-none">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 60 }}
        dpr={isMobile ? 1 : [1, 1.5]} // Limit pixel ratio on desktop, cap to 1 on mobile
        gl={{ antialias: true, alpha: true }}
      >
        {/* Responsive Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 3]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-5, -5, -2]} intensity={0.5} color="#6366f1" />

        {/* 3D Network */}
        <ConstellationNetwork
          nodeCount={nodeCount}
          connectionDistance={connectionDistance}
          reducedMotion={reducedMotion}
        />

        {/* Floating shapes */}
        <FloatingSubjectGeometries reducedMotion={reducedMotion} />

        {/* Sparkling particle field (disabled on mobile / reduced motion) */}
        {!reducedMotion && sparkleCount > 0 && (
          <Sparkles
            count={sparkleCount}
            scale={6}
            size={isMobile ? 1.5 : 2.5}
            speed={0.3}
            color="#6366f1"
          />
        )}

        {/* Camera Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.3}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
};

export default HeroScene3D;
