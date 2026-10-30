import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';

interface FoodItemConfig {
  id: string;
  url: string;
  name: string;
  initialPos: [number, number, number];
  initialRot: [number, number, number];
  scale: number;
  speed: {
    transX: number;
    transY: number;
    transZ: number;
    rotX: number;
    rotY: number;
    rotZ: number;
  };
  amplitude: {
    x: number;
    y: number;
    z: number;
  };
  phase: number;
}

// 3D Food Items Configurations representing NVIDIA SimReady / USDA Surplus Food Library
const FOOD_CONFIGS: FoodItemConfig[] = [
  {
    id: 'apple-1',
    url: '/models/apple.glb',
    name: 'Honeycrisp Apple',
    initialPos: [-3.8, 1.8, -1.2],
    initialRot: [0.3, 0.5, -0.2],
    scale: 0.85,
    speed: { transX: 0.6, transY: 0.8, transZ: 0.5, rotX: 0.25, rotY: 0.4, rotZ: 0.15 },
    amplitude: { x: 0.35, y: 0.45, z: 0.3 },
    phase: 0.2
  },
  {
    id: 'avocado-1',
    url: '/models/avocado.glb',
    name: 'Hass Avocado',
    initialPos: [3.6, 2.2, -0.8],
    initialRot: [0.5, -0.4, 0.3],
    scale: 0.9,
    speed: { transX: 0.7, transY: 0.9, transZ: 0.4, rotX: -0.2, rotY: 0.35, rotZ: 0.18 },
    amplitude: { x: 0.4, y: 0.5, z: 0.25 },
    phase: 1.5
  },
  {
    id: 'orange-1',
    url: '/models/orange.glb',
    name: 'Sunkist Orange',
    initialPos: [4.8, -0.8, -1.8],
    initialRot: [-0.2, 0.8, 0.4],
    scale: 0.8,
    speed: { transX: 0.5, transY: 0.7, transZ: 0.6, rotX: 0.3, rotY: -0.3, rotZ: 0.2 },
    amplitude: { x: 0.5, y: 0.4, z: 0.35 },
    phase: 2.8
  },
  {
    id: 'banana-1',
    url: '/models/banana.glb',
    name: 'Ripe Banana',
    initialPos: [-4.6, -1.2, -1.5],
    initialRot: [0.4, 1.2, -0.6],
    scale: 0.95,
    speed: { transX: 0.65, transY: 0.85, transZ: 0.45, rotX: 0.15, rotY: 0.3, rotZ: -0.25 },
    amplitude: { x: 0.45, y: 0.4, z: 0.3 },
    phase: 3.4
  },
  {
    id: 'tomato-1',
    url: '/models/tomato.glb',
    name: 'Vine Tomato',
    initialPos: [-1.8, 2.8, -2.2],
    initialRot: [-0.4, 0.3, 0.6],
    scale: 0.75,
    speed: { transX: 0.8, transY: 1.1, transZ: 0.5, rotX: -0.35, rotY: 0.45, rotZ: 0.2 },
    amplitude: { x: 0.3, y: 0.6, z: 0.4 },
    phase: 4.1
  },
  {
    id: 'lemon-1',
    url: '/models/lemon.glb',
    name: 'Meyer Lemon',
    initialPos: [2.2, -2.6, -1.4],
    initialRot: [0.6, -0.7, 0.2],
    scale: 0.7,
    speed: { transX: 0.75, transY: 0.95, transZ: 0.55, rotX: 0.4, rotY: -0.25, rotZ: 0.3 },
    amplitude: { x: 0.4, y: 0.5, z: 0.3 },
    phase: 5.0
  },
  {
    id: 'strawberry-1',
    url: '/models/strawberry.glb',
    name: 'Wild Strawberry',
    initialPos: [-2.5, -2.4, -0.9],
    initialRot: [0.2, -0.5, 0.7],
    scale: 0.65,
    speed: { transX: 0.9, transY: 1.2, transZ: 0.7, rotX: 0.5, rotY: 0.4, rotZ: -0.3 },
    amplitude: { x: 0.35, y: 0.45, z: 0.25 },
    phase: 0.9
  },
  {
    id: 'grapes-1',
    url: '/models/grapes.glb',
    name: 'Purple Grapes',
    initialPos: [1.6, 2.5, -2.6],
    initialRot: [0.1, 0.9, -0.3],
    scale: 0.85,
    speed: { transX: 0.55, transY: 0.75, transZ: 0.4, rotX: 0.2, rotY: 0.3, rotZ: 0.15 },
    amplitude: { x: 0.4, y: 0.35, z: 0.3 },
    phase: 2.1
  },
  {
    id: 'burger-1',
    url: '/models/burger.glb',
    name: 'Prepared Meal Bun',
    initialPos: [4.9, 0.7, -2.4],
    initialRot: [0.3, -0.4, 0.2],
    scale: 0.85,
    speed: { transX: 0.5, transY: 0.7, transZ: 0.4, rotX: 0.18, rotY: 0.25, rotZ: 0.12 },
    amplitude: { x: 0.35, y: 0.4, z: 0.3 },
    phase: 3.8
  }
];

// Single Floating Food Item with Continuous Multi-Axis Translation & Rotation
function FloatingFoodItem({ config, isDark }: { config: FoodItemConfig; isDark: boolean }) {
  const { scene } = useGLTF(config.url);
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Normalize model scale & center its geometry pivot
  const normalizedObject = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const factor = (config.scale * 1.5) / maxDim;
    clone.scale.setScalar(factor);

    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    clone.position.sub(center);

    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = false;
        if (child.material) {
          child.material.roughness = Math.max(0.25, child.material.roughness || 0.35);
          child.material.metalness = Math.min(0.15, child.material.metalness || 0.05);
          child.material.envMapIntensity = isDark ? 2.0 : 1.2;
        }
      }
    });

    const wrapper = new THREE.Group();
    wrapper.add(clone);
    return wrapper;
  }, [scene, config.scale, isDark]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() + config.phase;
    const { speed, amplitude, initialPos, initialRot } = config;

    // 1. Continuous Spatial Translation (Sinusoidal 3D Lissajous floating curves)
    const hoverBoost = hovered ? 1.6 : 1.0;
    const posX = initialPos[0] + Math.sin(t * speed.transX) * amplitude.x;
    const posY = initialPos[1] + Math.cos(t * speed.transY) * amplitude.y + (hovered ? 0.3 : 0);
    const posZ = initialPos[2] + Math.sin(t * speed.transZ) * amplitude.z;

    // Cursor mouse parallax influence based on Z depth
    const depthFactor = (posZ + 5) / 5;
    const parallaxX = state.pointer.x * 0.8 * depthFactor;
    const parallaxY = state.pointer.y * 0.6 * depthFactor;

    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, posX + parallaxX, 0.06);
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, posY + parallaxY, 0.06);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, posZ, 0.06);

    // 2. Continuous Multi-Axis Rotation & Tumbling
    meshRef.current.rotation.x = initialRot[0] + t * speed.rotX * hoverBoost;
    meshRef.current.rotation.y = initialRot[1] + t * speed.rotY * hoverBoost;
    meshRef.current.rotation.z = initialRot[2] + Math.sin(t * speed.rotZ) * 0.4;

    // 3. Gentle Breathing Scale Transform
    const scalePulse = 1 + Math.sin(t * 1.4) * 0.035 + (hovered ? 0.12 : 0);
    meshRef.current.scale.setScalar(scalePulse);
  });

  return (
    <group
      ref={meshRef}
      position={config.initialPos}
      rotation={config.initialRot}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <primitive object={normalizedObject} />
    </group>
  );
}

// Ambient Floating Micro-Particles (Spice / Seasoning / Light Motels)
function AmbientSpiceParticles({ isDark }: { isDark: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 75;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      const t = state.clock.getElapsedTime();
      pointsRef.current.rotation.y = t * 0.03;
      pointsRef.current.rotation.x = Math.sin(t * 0.04) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={isDark ? '#E06D3B' : '#3D8165'}
        transparent
        opacity={isDark ? 0.65 : 0.4}
        sizeAttenuation
      />
    </points>
  );
}

// Dynamic Adaptive Lighting System for Light & Dark Mode
function SceneLighting({ isDark }: { isDark: boolean }) {
  return (
    <>
      <ambientLight intensity={isDark ? 0.65 : 1.35} color={isDark ? '#D1FAE5' : '#FFFFFF'} />
      <directionalLight
        position={[6, 9, 6]}
        intensity={isDark ? 1.4 : 2.2}
        color={isDark ? '#FDE68A' : '#FFFFFF'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />
      {/* Studio Rim Lights */}
      <pointLight position={[-8, -4, -2]} intensity={isDark ? 2.2 : 1.1} color={isDark ? '#10B981' : '#059669'} />
      <pointLight position={[8, -5, 2]} intensity={isDark ? 2.5 : 1.1} color={isDark ? '#F97316' : '#EA580C'} />
      <directionalLight position={[0, -6, -4]} intensity={isDark ? 0.8 : 0.5} color={isDark ? '#5F9E83' : '#E2E8F0'} />
    </>
  );
}

// Preload models for immediate smooth display
FOOD_CONFIGS.forEach((c) => useGLTF.preload(c.url));

export function BackgroundFoodScene() {
  const { isDark } = useTheme();
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="absolute inset-0 bg-subtle-dots pointer-events-none opacity-50" />
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full pointer-events-auto"
      >
        <PerspectiveCamera makeDefault position={[0, 0, 7.2]} fov={45} />
        <SceneLighting isDark={isDark} />

        <Suspense fallback={null}>
          <group>
            {FOOD_CONFIGS.map((config) => (
              <FloatingFoodItem key={config.id} config={config} isDark={isDark} />
            ))}
            <AmbientSpiceParticles isDark={isDark} />
          </group>
        </Suspense>
      </Canvas>

      {/* Atmospheric depth vignette & contrast protection */}
      <div
        className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-b from-charcoal-950/70 via-charcoal-950/30 to-charcoal-950/90'
            : 'bg-gradient-to-b from-white/10 via-transparent to-slate-50/85'
        }`}
      />
    </div>
  );
}
