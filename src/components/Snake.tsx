import React, { useRef } from 'react';
import { Vector3, Group, Clock } from 'three';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial } from '@react-three/drei';

interface SnakeProps {
  positions: Vector3[];
}

const Snake: React.FC<SnakeProps> = ({ positions }) => {
  const snakeRef = useRef<Group>(null);
  
  // Add subtle animation to the snake
  useFrame(({ clock }: { clock: Clock }) => {
    if (snakeRef.current && positions.length > 0) {
      // Subtle bobbing effect for the head
      const headBob = Math.sin(clock.getElapsedTime() * 3) * 0.05;
      
      // Get all mesh children
      const meshes = snakeRef.current.children;
      if (meshes.length > 0) {
        // Animate the head
        meshes[0].position.y = 0.5 + headBob;
        
        // Subtle scale pulse for the body segments
        for (let i = 1; i < meshes.length; i++) {
          const pulse = Math.sin(clock.getElapsedTime() * 2 + i * 0.3) * 0.05;
          meshes[i].scale.set(1 + pulse, 1 + pulse, 1 + pulse);
        }
      }
    }
  });

  return (
    <group ref={snakeRef}>
      {positions.map((position, index) => {
        const isHead = index === 0;
        
        // Different colors and properties for head vs body
        const color = isHead ? '#0ea5e9' : '#38bdf8';
        const emissive = isHead ? '#0284c7' : '#0ea5e9';
        const emissiveIntensity = isHead ? 0.6 : 0.3;
        
        return (
          <group key={index} position={[position.x, 0, position.z]}>
            {/* Main snake segment */}
            <mesh 
              position={[0, 0.5, 0]}
              castShadow
              receiveShadow
            >
              {isHead ? (
                // Head is slightly larger and has eyes
                <>
                  <boxGeometry args={[0.95, 0.95, 0.95]} />
                  <meshStandardMaterial 
                    color={color} 
                    emissive={emissive}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.3}
                    metalness={0.7}
                  />
                  
                  {/* Left eye */}
                  <mesh position={[0.3, 0.3, 0.48]} rotation={[0, 0, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial color="white" />
                    <mesh position={[0.05, 0, 0.08]}>
                      <sphereGeometry args={[0.06, 16, 16]} />
                      <meshStandardMaterial color="#1e293b" />
                    </mesh>
                  </mesh>
                  
                  {/* Right eye */}
                  <mesh position={[-0.3, 0.3, 0.48]} rotation={[0, 0, 0]}>
                    <sphereGeometry args={[0.12, 16, 16]} />
                    <meshStandardMaterial color="white" />
                    <mesh position={[-0.05, 0, 0.08]}>
                      <sphereGeometry args={[0.06, 16, 16]} />
                      <meshStandardMaterial color="#1e293b" />
                    </mesh>
                  </mesh>
                </>
              ) : (
                // Body segments
                <>
                  <boxGeometry args={[0.9, 0.9, 0.9]} />
                  <meshStandardMaterial 
                    color={color} 
                    emissive={emissive}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.5}
                    metalness={0.4}
                  />
                </>
              )}
            </mesh>
            
            {/* Glow effect for better visibility */}
            <mesh position={[0, 0.5, 0]} scale={[1.1, 1.1, 1.1]}>
              <boxGeometry args={[0.95, 0.95, 0.95]} />
              <MeshDistortMaterial
                color={color}
                transparent
                opacity={0.15}
                distort={0.2}
                speed={2}
                emissive={emissive}
                emissiveIntensity={0.3}
              />
            </mesh>
            
            {/* Ground shadow for better depth perception */}
            <mesh 
              position={[0, 0.01, 0]} 
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
            >
              <circleGeometry args={[0.6, 16]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.2} 
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default Snake;
