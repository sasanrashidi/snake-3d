import React, { useRef } from 'react';
import { Vector3, Mesh, MeshStandardMaterial, Clock, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Trail, MeshDistortMaterial } from '@react-three/drei';

interface FoodProps {
  position: Vector3;
}

const Food: React.FC<FoodProps> = ({ position }) => {
  const foodRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const groupRef = useRef<Group>(null);
  
  // Create individual refs for each particle
  // This avoids calling hooks in loops which violates React's rules of hooks
  const particle0Ref = useRef<Mesh>(null);
  const particle1Ref = useRef<Mesh>(null);
  const particle2Ref = useRef<Mesh>(null);
  const particle3Ref = useRef<Mesh>(null);
  const particle4Ref = useRef<Mesh>(null);
  const particle5Ref = useRef<Mesh>(null);
  const particle6Ref = useRef<Mesh>(null);
  const particle7Ref = useRef<Mesh>(null);
  
  // Create an array of particle data with pre-defined refs
  const particleData = [
    { ref: particle0Ref, angle: 0, radius: 0.8, orbitSpeed: 0.2 },
    { ref: particle1Ref, angle: Math.PI * 0.25, radius: 0.8, orbitSpeed: 0.3 },
    { ref: particle2Ref, angle: Math.PI * 0.5, radius: 0.8, orbitSpeed: 0.2 },
    { ref: particle3Ref, angle: Math.PI * 0.75, radius: 0.8, orbitSpeed: 0.3 },
    { ref: particle4Ref, angle: Math.PI, radius: 0.8, orbitSpeed: 0.2 },
    { ref: particle5Ref, angle: Math.PI * 1.25, radius: 0.8, orbitSpeed: 0.3 },
    { ref: particle6Ref, angle: Math.PI * 1.5, radius: 0.8, orbitSpeed: 0.2 },
    { ref: particle7Ref, angle: Math.PI * 1.75, radius: 0.8, orbitSpeed: 0.3 },
  ];
  
  // Add animations to the food and particles
  useFrame(({ clock }: { clock: Clock }) => {
    if (foodRef.current) {
      // Floating animation
      foodRef.current.position.y = 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.3;
      
      // Rotation animation
      foodRef.current.rotation.y += 0.02;
      foodRef.current.rotation.x = Math.sin(clock.getElapsedTime()) * 0.2;
      
      // Pulsating emissive intensity
      if (materialRef.current) {
        materialRef.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
      }
      
      // Rotate the entire group for the orbiting particles
      if (groupRef.current) {
        groupRef.current.rotation.y += 0.01;
      }
      
      // Animate each particle
      particleData.forEach(particle => {
        if (particle.ref.current) {
          const t = clock.getElapsedTime() * particle.orbitSpeed;
          const x = Math.cos(particle.angle + t) * particle.radius;
          const z = Math.sin(particle.angle + t) * particle.radius;
          particle.ref.current.position.set(x, 0.5 + Math.sin(t * 2) * 0.2, z);
        }
      });
    }
  });

  return (
    <group position={[position.x, 0, position.z]}>
      {/* Main food sphere with trail */}
      <group>
        <Trail 
          width={0.5}
          length={8}
          color="#f97316"
          attenuation={(width) => width}
        >
          <mesh 
            ref={foodRef} 
            position={[0, 0.5, 0]}
            castShadow
          >
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial 
              ref={materialRef}
              color="#f97316" 
              emissive="#ea580c"
              emissiveIntensity={0.6}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </Trail>
      </group>
      
      {/* Outer glow effect */}
      <mesh position={[0, 0.5, 0]} scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <MeshDistortMaterial 
          color="#fb923c"
          transparent={true}
          opacity={0.2}
          distort={0.4}
          speed={4}
          emissive="#fb923c"
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Inner glow effect */}
      <mesh position={[0, 0.5, 0]} scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial 
          color="#fb923c"
          transparent={true}
          opacity={0.3}
          emissive="#fb923c"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Ground highlight for better visibility */}
      <mesh 
        position={[0, 0.02, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial 
          color="#fb923c" 
          transparent 
          opacity={0.2} 
        />
      </mesh>
      
      {/* Orbiting particles */}
      <group ref={groupRef}>
        {particleData.map((particle, i) => (
          <mesh 
            key={i} 
            ref={particle.ref}
            position={[
              Math.cos(particle.angle) * particle.radius, 
              0.5, 
              Math.sin(particle.angle) * particle.radius
            ]}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color="#fdba74"
              emissive="#fdba74"
              emissiveIntensity={0.6}
              transparent={true}
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default Food;
