import {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  Suspense,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Stars as DreiStars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
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

function makeLinkSegments(stars: PlacedStar[], onlyId: string | null = null) {
  const positions: number[] = [];
  for (const s of stars) {
    if (s.id === "sun") continue;
    if (onlyId !== null && s.id !== onlyId) continue;
    const [x, y, z] = s.position;
    positions.push(0, 0, 0, x, y, z);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  return geometry;
}

function LinksToSun({
  stars,
  selectedId,
}: {
  stars: PlacedStar[];
  selectedId: string | null;
}) {
  // Native LineSegments — more reliable than drei Line2 for many thin rays.
  const allGeom = useMemo(() => makeLinkSegments(stars), [stars]);
  const selectedGeom = useMemo(
    () => (selectedId ? makeLinkSegments(stars, selectedId) : null),
    [stars, selectedId],
  );

  useEffect(() => () => allGeom.dispose(), [allGeom]);
  useEffect(() => () => selectedGeom?.dispose(), [selectedGeom]);

  return (
    <group>
      <lineSegments geometry={allGeom} frustumCulled={false}>
        <lineBasicMaterial
          color="#5a9fd4"
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </lineSegments>

      {selectedGeom &&
        (selectedGeom.getAttribute("position")?.count ?? 0) > 0 && (
          <lineSegments geometry={selectedGeom} frustumCulled={false}>
            <lineBasicMaterial
              color="#9ecbff"
              transparent
              opacity={0.95}
              depthWrite={false}
            />
          </lineSegments>
        )}
    </group>
  );
}

/** Preferable elevated viewing direction (normalized later). */
const VIEW_DIR = new THREE.Vector3(0.55, 0.38, 0.74).normalize();
/** Distance multiplier on the fitted framing. 1 = tight fit; higher = farther out. */
const FIT_FILL = 0.95;

/**
 * Frame the perspective camera so the star neighborhood fills most of the view.
 * Re-runs when the visible set changes (e.g. radius slider).
 * Does not lock the camera — OrbitControls stay free afterward.
 */
function FitCameraToStars({
  stars,
  maxDistance,
  controlsRef,
}: {
  stars: PlacedStar[];
  maxDistance: number;
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    // Sun-centered radius from the farthest visible star (true neighborhood extent)
    let radius = 0;
    for (const s of stars) {
      const d = Math.hypot(s.position[0], s.position[1], s.position[2]);
      if (d > radius) radius = d;
    }
    // Fall back to the filter radius if catalog is empty for some reason
    radius = Math.max(radius, maxDistance * 0.35, 2);
    // Tiny pad for labels / glow (not full ring corners — that over-zoomed-out)
    radius += 0.8;

    const center = new THREE.Vector3(0, 0, 0);

    const perspective = camera as THREE.PerspectiveCamera;
    const vFov = THREE.MathUtils.degToRad(perspective.fov);
    const aspect =
      perspective.aspect || (size.width > 0 ? size.width / size.height : 1);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    // Fit to the tighter axis so nothing clips
    const fov = Math.min(vFov, hFov);
    // tan-fit fills the view better than sin-sphere; FIT_FILL zooms in a bit
    const distance = (radius / Math.tan(fov / 2)) * FIT_FILL;

    camera.position.copy(center).addScaledVector(VIEW_DIR, distance);
    camera.near = Math.max(distance / 200, 0.05);
    camera.far = Math.max(distance * 20, 200);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.copy(center);
      controls.minDistance = Math.max(radius * 0.05, 0.5);
      controls.maxDistance = Math.max(distance * 6, radius * 8);
      controls.update();
    }
  }, [stars, maxDistance, camera, size.width, size.height, controlsRef]);

  return null;
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
  const controlsRef = useRef<OrbitControlsImpl>(null);

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
        radius={120}
        depth={50}
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
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={0.5}
        maxDistance={200}
        target={[0, 0, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
      />

      {/* After controls so the ref is attached before the fit layout effect. */}
      <FitCameraToStars
        stars={stars}
        maxDistance={maxDistance}
        controlsRef={controlsRef}
      />
    </>
  );
}

export function StarMap(props: StarMapProps) {
  return (
    <div className="star-map-canvas">
      <Canvas
        camera={{ position: [0, 8, 20], fov: 50, near: 0.1, far: 500 }}
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
