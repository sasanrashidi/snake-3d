import React, { useEffect, useState, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import Snake from './Snake';
import Food from './Food';
import Grid from './Grid';
import { useGameState } from '../hooks/useGameState';
import { Vector3 } from 'three';

// Camera controller component to handle following the snake
const CameraController: React.FC<{ snakeHead: Vector3 }> = ({ snakeHead }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Update camera target to follow snake head
  useEffect(() => {
    if (controlsRef.current) {
      // Smoothly update the orbit controls target to follow the snake head
      controlsRef.current.target.set(
        snakeHead.x * 0.5, 
        0, 
        snakeHead.z * 0.5
      );
    }
  }, [snakeHead]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={8}
      maxDistance={25}
      maxPolarAngle={Math.PI / 2.5}
      minPolarAngle={Math.PI / 8}
      dampingFactor={0.1}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      enableDamping={true}
    />
  );
};

// Visual guide arrows to help with orientation
const DirectionGuides: React.FC = () => {
  return (
    <group position={[0, 0.2, 0]}>
      {/* X-axis (red) */}
      <mesh position={[11, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ff5555" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[12, 0, 0]} color="#ff5555" fontSize={0.8} anchorX="left">
        X
      </Text>
      
      {/* Z-axis (blue) */}
      <mesh position={[0, 0, 11]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#5555ff" emissive="#0000ff" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 0, 12]} color="#5555ff" fontSize={0.8} anchorX="left">
        Z
      </Text>
    </group>
  );
};

// Boundary walls to help with orientation
const BoundaryWalls: React.FC = () => {
  const halfSize = 10;
  const wallHeight = 1;
  
  return (
    <group>
      {/* Semi-transparent walls */}
      <mesh position={[0, wallHeight/2, -halfSize]} rotation={[0, 0, 0]}>
        <boxGeometry args={[halfSize * 2, wallHeight, 0.1]} />
        <meshStandardMaterial color="#3f51b5" transparent opacity={0.2} emissive="#3f51b5" emissiveIntensity={0.3} />
      </mesh>
      
      <mesh position={[0, wallHeight/2, halfSize]} rotation={[0, 0, 0]}>
        <boxGeometry args={[halfSize * 2, wallHeight, 0.1]} />
        <meshStandardMaterial color="#3f51b5" transparent opacity={0.2} emissive="#3f51b5" emissiveIntensity={0.3} />
      </mesh>
      
      <mesh position={[-halfSize, wallHeight/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[halfSize * 2, wallHeight, 0.1]} />
        <meshStandardMaterial color="#3f51b5" transparent opacity={0.2} emissive="#3f51b5" emissiveIntensity={0.3} />
      </mesh>
      
      <mesh position={[halfSize, wallHeight/2, 0]} rotation={[0, Math.PI/2, 0]}>
        <boxGeometry args={[halfSize * 2, wallHeight, 0.1]} />
        <meshStandardMaterial color="#3f51b5" transparent opacity={0.2} emissive="#3f51b5" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

const GameBoard: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [helpButtonPosition, setHelpButtonPosition] = useState({ x: 0, y: 0 });
  const helpButtonRef = useRef<HTMLButtonElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);
  const { 
    snakeBody, 
    foodPosition, 
    score, 
    gameOver, 
    isPaused,
    isGameActive,
    countdown,
    handleKeyDown, 
    resetGame,
    togglePause,
    startGame
  } = useGameState();

  // Set focus on the game container when component mounts
  useEffect(() => {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      (gameContainer as HTMLElement).focus();
    }
  }, []);

  // Position the help popup relative to the help button
  useEffect(() => {
    if (helpButtonRef.current && showInstructions) {
      const rect = helpButtonRef.current.getBoundingClientRect();
      setHelpButtonPosition({
        x: rect.right + 10,
        y: rect.top
      });
    }
  }, [showInstructions]);

  // Close instructions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        instructionsRef.current && 
        !instructionsRef.current.contains(event.target as Node) &&
        helpButtonRef.current && 
        !helpButtonRef.current.contains(event.target as Node)
      ) {
        setShowInstructions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle instructions visibility
  const toggleInstructions = () => {
    setShowInstructions(prev => !prev);
  };

  // Get snake head position for camera following
  const snakeHead = snakeBody.length > 0 ? snakeBody[0] : new Vector3(0, 0, 0);

  return (
    <div className="game-board">
      <div 
        className="game-container" 
        tabIndex={0} 
        onKeyDown={handleKeyDown}
      >
        <div className="game-info">
          <div className="score">Score: {score}</div>
          <div className="controls">
            {!isGameActive && !gameOver && (
              <button 
                className="control-btn start-btn" 
                onClick={startGame}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Starting in ${countdown}...` : 'Start Game'}
              </button>
            )}
            {isGameActive && !gameOver && (
              <button 
                className="control-btn pause-btn" 
                onClick={togglePause}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button 
              className="control-btn reset-btn" 
              onClick={resetGame}
            >
              {gameOver ? 'New Game' : 'Reset'}
            </button>
            <button 
              ref={helpButtonRef}
              className="control-btn help-btn" 
              onClick={toggleInstructions}
            >
              Help
            </button>
          </div>
        </div>
        {gameOver && (
          <div className="game-over" data-component-name="GameBoard">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button className="restart-btn" onClick={resetGame}>Play Again</button>
          </div>
        )}
        {countdown > 0 && !gameOver && (
          <div className="countdown">
            <span>{countdown}</span>
          </div>
        )}
        {showInstructions && !gameOver && (
          <div 
            className="instructions" 
            ref={instructionsRef}
            style={{
              position: 'absolute',
              top: `${helpButtonPosition.y}px`,
              left: `${helpButtonPosition.x}px`,
              zIndex: 100
            }}
            data-component-name="GameBoard"
          >
            <h3>How to Play</h3>
            <ul>
              <li>
                <span className="action">Movement:</span>
                <div className="movement-keys">
                  <span className="movement-label">Use</span>
                  <div className="key-group">
                    <kbd>↑</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd>
                  </div> 
                  <span className="movement-label">or</span>
                  <div className="key-group">
                    <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
                  </div>
                </div>
              </li>
              <li>
                <span className="objective">Collect</span> the glowing red orbs to grow your snake
              </li>
              <li>
                <span className="warning">Avoid</span> hitting walls and your own body
              </li>
              <li>
                Press <kbd>Space</kbd> to pause/resume the game
              </li>
              <li>
                Press <kbd>R</kbd> to restart at any time
              </li>
              <li>
                The game gets faster as your score increases!
              </li>
            </ul>
          </div>
        )}
        <Canvas shadows frameloop="demand" gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          {/* Custom camera setup */}
          <PerspectiveCamera makeDefault position={[0, 15, 15]} fov={50} />
          <CameraController snakeHead={snakeHead} />
          
          {/* Scene environment */}
          <color attach="background" args={['#0a1929']} />
          <fog attach="fog" args={['#0a1929', 15, 40]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.6} color="#ffffff" />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.2} 
            color="#ffffff"
            castShadow 
            shadow-mapSize-width={2048} 
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <directionalLight position={[-10, 10, -10]} intensity={0.4} color="#4fc3f7" />
          <hemisphereLight intensity={0.5} color="#64b5f6" groundColor="#0a1929" />
          
          <group position={[0, -0.5, 0]}>
            {/* Game elements */}
            <Grid />
            <Snake positions={snakeBody} />
            <Food position={foodPosition} />
            <DirectionGuides />
            <BoundaryWalls />
            
            {/* Game title floating in 3D space */}
            <Text
              position={[0, 5, -10]}
              color="#4CAF50"
              fontSize={1.5}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.05}
              outlineColor="#004d40"
            >
              3D SNAKE
            </Text>
            
            {/* Score in 3D space */}
            {score > 0 && (
              <Text
                position={[-8, 5, -5]}
                color="#FFD700"
                fontSize={0.8}
                anchorX="left"
                anchorY="middle"
                outlineWidth={0.02}
                outlineColor="#b7950b"
              >
                {`SCORE: ${score}`}
              </Text>
            )}
            
            {/* Countdown in 3D space */}
            {countdown > 0 && (
              <Text
                position={[0, 3, 0]}
                color="#FF9800"
                fontSize={3}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.1}
                outlineColor="#E65100"
              >
                {countdown}
              </Text>
            )}
            
            {/* Game over text in 3D space */}
            {gameOver && (
              <Text
                position={[0, 5, 0]}
                color="#FF5722"
                fontSize={1.2}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="#bf360c"
              >
                GAME OVER
              </Text>
            )}
          </group>
        </Canvas>
      </div>
    </div>
  );
};

export default GameBoard;
