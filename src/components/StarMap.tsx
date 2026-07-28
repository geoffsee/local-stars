import { useMemo, useRef, useState, useCallback, Suspense } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Stars as DreiStars,
  Line,
} from "@react-three/drei";
import * as THREE from "three";
import { placeStars, type PlacedStar } from "../data/nearbyStars";

const DISTANCE_RINGS = [5, 10, 15, 20]; // light-years

interface StarMapProps {
  maxDistance: number;
  showLabels: boolean;
  showRings: boolean;
  showLinks: boolean;
  autoRotate: boolean;
  selectedId: string | null;
  onSelect: (star: PlacedStar | null) => void;
}

function DistanceRings({ maxDistance }: { maxDistance: number }) {
  const rings = DISTANCE_RINGS.filter((d) => d <= maxDistance + 0.5);
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {rings.map((d) => (
        <mesh key={d}>
          <ringGeometry args={[d - 0.015, d + 0.015, 128]} />
          <meshBasicMaterial
            color="#2a4a6a"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function DistanceRingLabels({ maxDistance }: { maxDistance: number }) {
  const rings = DISTANCE_RINGS.filter((d) => d <= maxDistance + 0.5);
  return (
    <>
      {rings.map((d) => (
        <Html
          key={d}
          position={[d, 0.05, 0]}
          center
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div className="ring-label">{d} ly</div>
        </Html>
      ))}
    </>
  );
}

function SunCore() {
  const glowRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.04;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.22, 48, 48]} />
        <meshBasicMaterial color="#fff4c0" />
      </mesh>
      {/* Inner glow */}
      <mesh ref={glowRef} scale={1.35}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial
          color="#ffcc44"
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      {/* Outer halo */}
      <mesh scale={2.2}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial
          color="#ffaa22"
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#ffdd88" intensity={2.5} distance={40} decay={2} />
    </group>
  );
}

function StarBody({
  star,
  selected,
  showLabel,
  onSelect,
}: {
  star: PlacedStar;
  selected: boolean;
  showLabel: boolean;
  onSelect: (star: PlacedStar) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const isSun = star.id === "sun";

  useFrame(({ clock }) => {
    if (meshRef.current && (hovered || selected) && !isSun) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 4) * 0.08;
      meshRef.current.scale.setScalar(pulse);
    } else if (meshRef.current && !isSun) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelect(star);
    },
    [onSelect, star],
  );

  if (isSun) {
    return (
      <group position={star.position}>
        <SunCore />
        {showLabel && (
          <Html
            position={[0, 0.55, 0]}
            center
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            <div className={`star-label sun-label ${selected ? "selected" : ""}`}>
              Sun
            </div>
          </Html>
        )}
        {/* Invisible hit target */}
        <mesh
          onClick={handleClick}
          onPointerOver={() => {
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "default";
          }}
        >
          <sphereGeometry args={[0.45, 16, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  const emissiveIntensity = selected || hovered ? 1.4 : 0.85;
  const show = showLabel || hovered || selected;

  return (
    <group position={star.position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[star.radius, 24, 24]} />
        <meshStandardMaterial
          color={star.color}
          emissive={star.color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.35}
          metalness={0.1}
        />
      </mesh>

      {/* Soft glow shell */}
      <mesh scale={1.8}>
        <sphereGeometry args={[star.radius, 16, 16]} />
        <meshBasicMaterial
          color={star.color}
          transparent
          opacity={selected || hovered ? 0.28 : 0.12}
          depthWrite={false}
        />
      </mesh>

      {show && (
        <Html
          position={[0, star.radius + 0.28, 0]}
          center
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          <div
            className={`star-label ${selected ? "selected" : ""} ${hovered ? "hovered" : ""}`}
          >
            {star.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function LinksToSun({
  stars,
  selectedId,
}: {
  stars: PlacedStar[];
  selectedId: string | null;
}) {
  const lines = useMemo(() => {
    return stars
      .filter((s) => s.id !== "sun" && (selectedId === null || s.id === selectedId))
      .map((s) => ({
        id: s.id,
        points: [
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(...s.position),
        ] as [THREE.Vector3, THREE.Vector3],
        color: s.id === selectedId ? "#6ab0ff" : "#1e3a55",
        opacity: s.id === selectedId ? 0.7 : 0.25,
      }));
  }, [stars, selectedId]);

  return (
    <>
      {lines.map((l) => (
        <Line
          key={l.id}
          points={l.points}
          color={l.color}
          lineWidth={l.id === selectedId ? 1.5 : 0.6}
          transparent
          opacity={l.opacity}
        />
      ))}
    </>
  );
}

function SceneContent({
  maxDistance,
  showLabels,
  showRings,
  showLinks,
  autoRotate,
  selectedId,
  onSelect,
}: StarMapProps) {
  const stars = useMemo(() => {
    return placeStars().filter(
      (s) => s.id === "sun" || s.distanceLy <= maxDistance,
    );
  }, [maxDistance]);

  // Notable stars always labeled when labels on; others only if selected/hover
  const shouldShowLabel = (s: PlacedStar) => {
    if (!showLabels) return selectedId === s.id;
    return Boolean(s.notable) || selectedId === s.id;
  };

  return (
    <>
      <color attach="background" args={["#000008"]} />
      <ambientLight intensity={0.25} />

      <DreiStars
        radius={80}
        depth={40}
        count={4000}
        factor={2.5}
        saturation={0}
        fade
        speed={0.2}
      />

      {showRings && (
        <>
          <DistanceRings maxDistance={maxDistance} />
          <DistanceRingLabels maxDistance={maxDistance} />
        </>
      )}

      {showLinks && <LinksToSun stars={stars} selectedId={selectedId} />}

      {stars.map((star) => (
        <StarBody
          key={star.id}
          star={star}
          selected={selectedId === star.id}
          showLabel={shouldShowLabel(star)}
          onSelect={onSelect}
        />
      ))}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1.5}
        maxDistance={55}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
      />
    </>
  );
}

export function StarMap(props: StarMapProps) {
  return (
    <div className="star-map-canvas">
      <Canvas
        camera={{ position: [8, 6, 14], fov: 50, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => props.onSelect(null)}
      >
        <Suspense fallback={null}>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export type { PlacedStar };
