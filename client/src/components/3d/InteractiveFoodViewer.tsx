import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles, ShieldCheck, RefreshCw, Flame, Heart } from 'lucide-react';

interface FoodItemMeta {
  id: string;
  name: string;
  category: string;
  modelUrl: string;
  co2Savings: string;
  shelfLife: string;
  nutrition: string;
  badge: string;
}

const FEATURED_ITEMS: FoodItemMeta[] = [
  {
    id: 'avocado',
    name: 'Organic Hass Avocado',
    category: 'Fresh Produce',
    modelUrl: '/models/avocado.glb',
    co2Savings: '1.8 kg CO₂e',
    shelfLife: '48h window',
    nutrition: 'Healthy fats & potassium',
    badge: 'High Priority'
  },
  {
    id: 'apple',
    name: 'Honeycrisp Apples',
    category: 'Orchard Surplus',
    modelUrl: '/models/apple.glb',
    co2Savings: '2.1 kg CO₂e',
    shelfLife: '72h window',
    nutrition: 'Fiber & Vitamin C',
    badge: '100% Edible'
  },
  {
    id: 'tomato',
    name: 'Heirloom Vine Tomatoes',
    category: 'Farm Direct',
    modelUrl: '/models/tomato.glb',
    co2Savings: '1.4 kg CO₂e',
    shelfLife: '36h window',
    nutrition: 'Lycopene & Antioxidants',
    badge: 'Immediate Rescue'
  },
  {
    id: 'orange',
    name: 'Valencia Oranges',
    category: 'Citrus Grove',
    modelUrl: '/models/orange.glb',
    co2Savings: '1.9 kg CO₂e',
    shelfLife: '5 days',
    nutrition: 'Immunity Boost',
    badge: 'Verified Fresh'
  }
];

function ModelObject({ url, isDark }: { url: string; isDark: boolean }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  const centeredObject = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const factor = 1.9 / maxDim;
    clone.scale.setScalar(factor);

    const scaledBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    clone.position.sub(center);

    clone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.castShadow = true;
        child.material.roughness = Math.max(0.2, child.material.roughness || 0.3);
        child.material.envMapIntensity = isDark ? 2.0 : 1.4;
      }
    });

    const wrapper = new THREE.Group();
    wrapper.add(clone);
    return wrapper;
  }, [scene, isDark]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.y = t * 0.45;
      meshRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive object={centeredObject} />
    </group>
  );
}

export function InteractiveFoodViewer() {
  const { isDark } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = FEATURED_ITEMS[selectedIndex];

  return (
    <div className="relative rounded-3xl overflow-hidden glass-card p-6 shadow-soft-xl border border-charcoal-800 transition-all duration-300">
      {/* Top Header Card Info */}
      <div className="flex items-center justify-between pb-3 border-b border-charcoal-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Live Rescued Asset • 3D SimReady
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-cream-50 font-editorial mt-0.5">
            {current.name}
          </h3>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-citrus-950/80 text-citrus-300 border border-citrus-800">
          {current.badge}
        </span>
      </div>

      {/* 3D Canvas Showcase */}
      <div className="relative w-full h-56 sm:h-64 my-2 cursor-grab active:cursor-grabbing">
        <Canvas
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
          camera={{ position: [0, 0.5, 3.2], fov: 42 }}
        >
          <ambientLight intensity={0.9} color="#FFFFFF" />
          <directionalLight position={[4, 6, 4]} intensity={1.6} color="#FFFFFF" castShadow />
          <pointLight position={[-4, -2, -2]} intensity={2.0} color="#10B981" />
          <pointLight position={[4, 2, 2]} intensity={1.1} color="#F97316" />

          <Suspense fallback={null}>
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
              <ModelObject key={current.id} url={current.modelUrl} isDark={true} />
            </Float>
          </Suspense>

          <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.7} minPolarAngle={Math.PI / 3} />
        </Canvas>

        {/* 360 Drag Prompt */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-charcoal-950/80 text-white text-[10px] backdrop-blur-md shadow-sm border border-charcoal-800">
          <RefreshCw className="w-3 h-3 text-citrus-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Interactive 360° Drag & Rotate</span>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-charcoal-800 text-center">
        <div className="p-2.5 rounded-xl bg-charcoal-850/80 border border-charcoal-700/60">
          <p className="text-[10px] text-charcoal-400 font-medium">CO₂ Prevented</p>
          <p className="text-xs font-bold text-emerald-400 mt-0.5">{current.co2Savings}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-charcoal-850/80 border border-charcoal-700/60">
          <p className="text-[10px] text-charcoal-400 font-medium">Safe Window</p>
          <p className="text-xs font-bold text-citrus-400 mt-0.5">{current.shelfLife}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-charcoal-850/80 border border-charcoal-700/60">
          <p className="text-[10px] text-charcoal-400 font-medium">Impact Safety</p>
          <p className="text-xs font-bold text-cream-100 mt-0.5 flex items-center justify-center gap-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% OK
          </p>
        </div>
      </div>

      {/* Quick Model Selector Pills */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {FEATURED_ITEMS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelectedIndex(idx)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedIndex === idx
                ? 'bg-emerald-500 text-charcoal-950 font-bold shadow-soft-sm scale-105'
                : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700 border border-charcoal-700/50'
            }`}
          >
            {item.name.split(' ')[1] || item.name}
          </button>
        ))}
      </div>
    </div>
  );
}
