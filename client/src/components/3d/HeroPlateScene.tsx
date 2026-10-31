import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Interface for normalized GLTF model props
interface PhotorealisticFoodProps {
  url: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  targetSize?: number;
  floatSpeed?: number;
  delay?: number;
}

// Normalized, Auto-Centered Photorealistic Food Component
function PhotorealisticFood({
  url,
  position,
  rotation = [0, 0, 0],
  targetSize = 1.0,
  floatSpeed = 1.2,
  delay = 0
}: PhotorealisticFoodProps) {
  const { scene } = useGLTF(url);

  // Clone and automatically center & scale the mesh to target physical size
  const centeredObject = useMemo(() => {
    const clone = scene.clone(true);

    // Compute bounding box
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;

    // Normalization factor
    const scaleFactor = targetSize / maxDim;
    clone.scale.setScalar(scaleFactor);

    // Recompute center after scale and offset so pivot is exact center
    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    clone.position.sub(center);

    // Apply PBR shadow settings and material enhancements
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = Math.max(0.2, child.material.roughness || 0.3);
          child.material.envMapIntensity = 1.4;
        }
      }
    });

    const wrapper = new THREE.Group();
    wrapper.add(clone);
    return wrapper;
  }, [scene, targetSize]);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime() + delay;
      groupRef.current.position.y = position[1] + Math.sin(t * floatSpeed) * 0.12;
      groupRef.current.rotation.y = rotation[1] + t * 0.2;
      groupRef.current.rotation.x = rotation[0] + Math.sin(t * 0.7) * 0.08;
      groupRef.current.rotation.z = rotation[2] + Math.cos(t * 0.6) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <primitive object={centeredObject} />
    </group>
  );
}

// Ceramic Presentation Platter
function CeramicPlatter() {
  const plateRef = useRef<THREE.Group>(null);

  return (
    <group ref={plateRef} position={[0, -0.65, 0]}>
      {/* Porcelain Platter Base */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[2.7, 2.0, 0.28, 64]} />
        <meshPhysicalMaterial
          color="#FAF8F5"
          roughness={0.12}
          metalness={0.04}
          clearcoat={0.95}
          clearcoatRoughness={0.08}
          reflectivity={0.8}
        />
      </mesh>

      {/* Recessed Interior Surface */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 1.8, 0.1, 64]} />
        <meshPhysicalMaterial
          color="#F2ECE1"
          roughness={0.2}
          metalness={0.02}
          clearcoat={0.7}
        />
      </mesh>

      {/* Elegant Rose-Gold Accent Trim */}
      <mesh position={[0, 0.12, 0]}>
        <ringGeometry args={[2.48, 2.54, 64]} />
        <meshStandardMaterial
          color="#E06D3B"
          metalness={0.85}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Floating Crisp Salad Greens
function SaladLeaf({ position, rotation, scale = 1, delay = 0 }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() + delay;
      ref.current.position.y = position[1] + Math.sin(t * 1.3) * 0.1;
      ref.current.rotation.z = rotation[2] + Math.sin(t * 0.9) * 0.08;
    }
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale} castShadow>
      <cylinderGeometry args={[0.42, 0.08, 0.02, 16]} />
      <meshStandardMaterial
        color="#2E7D32"
        roughness={0.35}
        metalness={0.05}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Ambient Sparkling Spice Particles
function SeasoningParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 50;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.0 + Math.random() * 2.3;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.2) * 1.8;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#E06D3B"
        transparent
        opacity={0.75}
        sizeAttenuation
      />
    </points>
  );
}

// Master Interactive 3D Composition with Photorealistic Food Assets
function PlateComposition() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      // Mouse responsive parallax tilt
      const targetX = (state.pointer.x * Math.PI) / 10;
      const targetY = (-state.pointer.y * Math.PI) / 14;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX + t * 0.12, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY + 0.32, 0.05);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]} scale={0.88}>
      <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.3}>
        <CeramicPlatter />

        {/* Photorealistic Burger in the center */}
        <PhotorealisticFood
          url="/models/burger.glb"
          position={[0.0, 0.12, 0.0]}
          rotation={[0.1, 0.4, -0.05]}
          targetSize={1.15}
          floatSpeed={1.0}
          delay={0.0}
        />

        {/* Photorealistic Avocado on the right */}
        <PhotorealisticFood
          url="/models/avocado.glb"
          position={[1.1, 0.35, 0.3]}
          rotation={[0.3, 0.8, -0.2]}
          targetSize={1.05}
          floatSpeed={1.3}
          delay={0.3}
        />

        {/* Photorealistic Crisp Apple on the left */}
        <PhotorealisticFood
          url="/models/apple.glb"
          position={[-1.1, 0.38, 0.4]}
          rotation={[0.2, -0.5, 0.3]}
          targetSize={0.95}
          floatSpeed={1.2}
          delay={0.6}
        />

        {/* Photorealistic Fresh Orange on back-right */}
        <PhotorealisticFood
          url="/models/orange.glb"
          position={[0.85, 0.55, -0.7]}
          rotation={[-0.2, 0.4, 0.1]}
          targetSize={0.9}
          floatSpeed={1.4}
          delay={0.9}
        />

        {/* Photorealistic Ripe Tomato on back-left */}
        <PhotorealisticFood
          url="/models/tomato.glb"
          position={[-0.75, 0.6, -0.6]}
          rotation={[0.4, -0.3, -0.2]}
          targetSize={0.85}
          floatSpeed={1.1}
          delay={1.2}
        />

        {/* Photorealistic Strawberry hovering front */}
        <PhotorealisticFood
          url="/models/strawberry.glb"
          position={[0.3, 0.65, 0.85]}
          rotation={[0.5, 0.2, 0.4]}
          targetSize={0.65}
          floatSpeed={1.5}
          delay={1.5}
        />

        {/* Photorealistic Fresh Lemon floating */}
        <PhotorealisticFood
          url="/models/lemon.glb"
          position={[-0.45, 0.62, 0.8]}
          rotation={[-0.3, 0.6, -0.4]}
          targetSize={0.75}
          floatSpeed={1.3}
          delay={0.7}
        />

        {/* Complementary Crisp Salad Leaves */}
        <SaladLeaf position={[-0.4, 0.2, 0.5]} rotation={[0.4, 0.2, 0.5]} scale={1.1} delay={0.1} />
        <SaladLeaf position={[0.7, 0.25, -0.15]} rotation={[-0.3, 0.6, -0.4]} scale={0.9} delay={0.9} />
        <SaladLeaf position={[-0.6, 0.5, 0.15]} rotation={[0.2, -0.5, 0.3]} scale={0.8} delay={1.4} />

        <SeasoningParticles />
      </Float>

      {/* Realistic Soft Contact Shadow */}
      <ContactShadows
        position={[0, -1.0, 0]}
        opacity={0.42}
        scale={6.0}
        blur={2.5}
        far={3.2}
      />
    </group>
  );
}

// Preload high-fidelity assets for instant silky load
useGLTF.preload('/models/burger.glb');
useGLTF.preload('/models/avocado.glb');
useGLTF.preload('/models/apple.glb');
useGLTF.preload('/models/orange.glb');
useGLTF.preload('/models/tomato.glb');
useGLTF.preload('/models/strawberry.glb');
useGLTF.preload('/models/lemon.glb');

export function HeroPlateScene() {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-8">
        <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-gradient-to-tr from-cream-300 via-white to-forest-50 p-6 shadow-soft-lg border border-cream-300 flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
            alt="Fresh healthy surplus food on ceramic plate"
            className="w-full h-full object-cover rounded-full shadow-inner animate-pulse"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <PerspectiveCamera makeDefault position={[0, 2.2, 5.8]} fov={38} />

        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={1.3} color="#FFFBF2" />
        <directionalLight
          position={[6, 9, 5]}
          intensity={2.4}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0001}
          color="#FFF8EE"
        />
        <directionalLight
          position={[-6, 4, -3]}
          intensity={1.0}
          color="#E0F2FE"
        />
        <pointLight position={[0, -0.5, 2.5]} intensity={0.6} color="#E06D3B" />
        <pointLight position={[2, 2, -1]} intensity={0.4} color="#34D399" />

        <Suspense fallback={null}>
          <PlateComposition />
        </Suspense>
      </Canvas>

      {/* Interactive Hint */}
      <div className="absolute bottom-3 right-6 pointer-events-none hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-900/90 backdrop-blur-md border border-charcoal-700 text-[11px] font-medium text-emerald-300 shadow-soft-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        NVIDIA SimReady 3D • Interactive Food Physics
      </div>
    </div>
  );
}
