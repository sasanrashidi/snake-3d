import React, { useRef } from 'react';
import { Vector3, Group, Clock } from 'three';
import { Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// Define grid size constant since we can't import it yet
const GRID_SIZE = 20;

const Grid: React.FC = () => {
  const gridRef = useRef<Group>(null);
  
  // Add subtle animation to the grid
  useFrame(({ clock }: { clock: Clock }) => {
    if (gridRef.current) {
      // Subtle breathing effect
      const pulse = Math.sin(clock.getElapsedTime() * 0.5) * 0.03;
      gridRef.current.scale.set(1 + pulse, 1, 1 + pulse);
    }
  });
  
  // Create grid lines
  const gridLines = [];
  const size = GRID_SIZE;
  const halfSize = size / 2;

  // Create horizontal grid lines
  for (let i = 0; i <= size; i++) {
    const position = i - halfSize;
    const points = [
      new Vector3(-halfSize, 0, position),
      new Vector3(halfSize, 0, position)
    ];
    
    // Make the center lines brighter
    const isCenter = i === size / 2;
    const color = isCenter ? "#0ea5e9" : "#f1f5f9";
    const lineWidth = isCenter ? 2 : 1;
    
    gridLines.push(
      <Line 
        key={`h-${i}`}
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={isCenter ? 0.7 : 0.3}
      />
    );
  }

  // Create vertical grid lines
  for (let i = 0; i <= size; i++) {
    const position = i - halfSize;
    const points = [
      new Vector3(position, 0, -halfSize),
      new Vector3(position, 0, halfSize)
    ];
    
    // Make the center lines brighter
    const isCenter = i === size / 2;
    const color = isCenter ? "#0ea5e9" : "#f1f5f9";
    const lineWidth = isCenter ? 2 : 1;
    
    gridLines.push(
      <Line 
        key={`v-${i}`}
        points={points}
        color={color}
        lineWidth={lineWidth}
        transparent
        opacity={isCenter ? 0.7 : 0.3}
      />
    );
  }

  // Create grid border
  const borderPoints = [
    new Vector3(-halfSize, 0, -halfSize),
    new Vector3(halfSize, 0, -halfSize),
    new Vector3(halfSize, 0, halfSize),
    new Vector3(-halfSize, 0, halfSize),
    new Vector3(-halfSize, 0, -halfSize)
  ];
  
  return (
    <group ref={gridRef}>
      {/* Base grid plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          color="#f1f5f9" 
          metalness={0.1}
          roughness={0.4}
          emissive="#e2e8f0"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Grid border */}
      <Line 
        points={borderPoints}
        color="#0ea5e9"
        lineWidth={3}
        transparent
        opacity={0.6}
      />
      
      {/* Grid lines */}
      {gridLines}
    </group>
  );
};

export default Grid;
