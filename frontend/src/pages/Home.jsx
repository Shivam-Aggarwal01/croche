import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, MeshDistortMaterial, Float } from '@react-three/drei';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function AnimatedYarn() {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.15;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
  });

  return (
    <PresentationControls
      global
      config={{ mass: 2, tension: 500 }}
      snap={{ mass: 4, tension: 1500 }}
      rotation={[0, 0.3, 0]}
      polar={[-Math.PI / 3, Math.PI / 3]}
      azimuth={[-Math.PI / 1.4, Math.PI / 2]}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
        <mesh ref={meshRef} position={[0, 0, 0]} scale={2}>
          <sphereGeometry args={[1, 128, 128]} />
          <MeshDistortMaterial
            color="#E6D0BA"
            attach="material"
            distort={0.5}
            speed={1.5}
            roughness={0.2}
            metalness={0.1}
            wireframe={true}
          />
        </mesh>
      </Float>
    </PresentationControls>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-brand-50 via-brand-100/30 to-brand-50 pt-20">
      
      {/* 3D Background / Hero Canvas */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={3} color="#ffffff" />
          <pointLight position={[-10, -10, -5]} intensity={1} color="#E2A7A7" />
          <AnimatedYarn />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-[-4vh]">
        <motion.div
           initial={{ opacity: 0, scale: 0.92 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1 }}
           className="glass inline-block w-full px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-14 rounded-[2rem] shadow-2xl border border-white/50 backdrop-blur-xl"
        >
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-black text-brand-900 mb-5 md:mb-6 drop-shadow-sm tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Handcrafted <br />
            <span className="text-brand-600 italic font-serif font-light">Elegance</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-brand-800 mb-10 max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover our collection of premium, bespoke crochet clothing designed to make you stand out.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link 
              to="/products" 
              className="px-10 py-5 rounded-full font-bold text-lg transition-all transform hover:-translate-y-1 w-full sm:w-auto shop-button"
            >
              Shop Collection
            </Link>
            <Link 
              to="/custom-order" 
              className="px-10 py-5 bg-white text-brand-900 rounded-full font-bold text-lg hover:bg-brand-50 hover:shadow-2xl transition-all transform hover:-translate-y-1 w-full sm:w-auto border border-brand-200"
            >
              Custom Request
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Aesthetic Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
  );
}
