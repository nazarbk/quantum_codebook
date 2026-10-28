import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BlochCoordinates } from '../../utils/quantumMath';
import { Theme } from '../../types/theme';

interface BlochSphereProps {
  coordinates?: BlochCoordinates;
  targetCoordinates?: BlochCoordinates;
  size?: number;
  showLabels?: boolean;
  theme?: Theme;
}

export const BlochSphere: React.FC<BlochSphereProps> = ({
  coordinates = { x: 0, y: 0, z: 1 },
  targetCoordinates,
  size = 320,
  showLabels = true,
  theme = 'dark',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetCoords = useRef<BlochCoordinates>(coordinates);
  const currentCoords = useRef<BlochCoordinates>(coordinates);
  const targetGoalCoords = useRef<BlochCoordinates | undefined>(targetCoordinates);

  useEffect(() => {
    targetCoords.current = coordinates;
  }, [coordinates]);

  useEffect(() => {
    targetGoalCoords.current = targetCoordinates;
  }, [targetCoordinates]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'dark' ? 0x101f31 : 0xf7f9fc);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(2.5, 2.0, 3.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const sphereRadius = 1.2;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x5b7fc8 : 0x6689c9,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    const ringGeo = new THREE.RingGeometry(sphereRadius - 0.005, sphereRadius + 0.005, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: theme === 'dark' ? 0x63758d : 0x8798ad,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const equator = new THREE.Mesh(ringGeo, ringMat);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    const axisLength = sphereRadius * 1.35;

    const zAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -axisLength, 0),
      new THREE.Vector3(0, axisLength, 0),
    ]);
    scene.add(new THREE.Line(zAxisGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8 })));

    const xAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLength, 0, 0),
      new THREE.Vector3(axisLength, 0, 0),
    ]);
    scene.add(new THREE.Line(xAxisGeo, new THREE.LineBasicMaterial({ color: 0xf43f5e })));

    const yAxisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLength),
      new THREE.Vector3(0, 0, axisLength),
    ]);
    scene.add(new THREE.Line(yAxisGeo, new THREE.LineBasicMaterial({ color: 0x10b981 })));

    // three.js is right-handed with Y up. Bloch (x, y, z) maps to three (x, z, -y): swapping
    // two axes alone would be a reflection and draw a mirror-image sphere (S would rotate
    // |+⟩ the wrong way round), so the sign flip keeps the frame right-handed.
    const getThreeVector = (coords: BlochCoordinates) => {
      return new THREE.Vector3(
        coords.x * sphereRadius,
        coords.z * sphereRadius,
        -coords.y * sphereRadius
      );
    };

    const initialDir = getThreeVector(currentCoords.current).normalize();
    const arrowHelper = new THREE.ArrowHelper(
      initialDir,
      new THREE.Vector3(0, 0, 0),
      sphereRadius,
      0xf59e0b,
      0.2,
      0.12
    );
    scene.add(arrowHelper);

    const pointGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const pointMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
    const pointMesh = new THREE.Mesh(pointGeo, pointMat);
    scene.add(pointMesh);

    const targetArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), sphereRadius,
      0x22d3ee, 0.16, 0.1
    );
    targetArrow.visible = Boolean(targetGoalCoords.current);
    scene.add(targetArrow);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const lerpFactor = 0.1;
      currentCoords.current.x += (targetCoords.current.x - currentCoords.current.x) * lerpFactor;
      currentCoords.current.y += (targetCoords.current.y - currentCoords.current.y) * lerpFactor;
      currentCoords.current.z += (targetCoords.current.z - currentCoords.current.z) * lerpFactor;

      const targetVec = getThreeVector(currentCoords.current);
      const length = targetVec.length();

      // A reduced (entangled) qubit can have a short or even zero-length Bloch vector.
      const headLength = Math.min(0.2, length * 0.5);
      arrowHelper.visible = length > 0.02;
      if (arrowHelper.visible) {
        arrowHelper.setDirection(targetVec.clone().normalize());
        arrowHelper.setLength(length, headLength, Math.min(0.12, headLength * 0.6));
      }
      pointMesh.position.copy(targetVec);

      const goal = targetGoalCoords.current;
      targetArrow.visible = Boolean(goal);
      if (goal) {
        const goalVector = getThreeVector(goal);
        const goalLength = goalVector.length();
        if (goalLength > 0) {
          targetArrow.setDirection(goalVector.clone().normalize());
          targetArrow.setLength(goalLength, 0.16, 0.1);
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pointGeo.dispose();
      pointMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, theme]);

  return (
    <div className="relative flex flex-col items-center justify-center bg-slate-900/90 rounded-2xl border border-slate-800 p-3 shadow-xl">
      <div ref={mountRef} className="cursor-grab active:cursor-grabbing rounded-xl overflow-hidden" />

      {showLabels && (
        <div className="w-full mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
          <div className="bg-slate-950/60 p-1 rounded-lg border border-rose-500/30 text-rose-400">
            <span className="block font-bold">X (|+⟩/|-⟩)</span>
            <span>{coordinates.x.toFixed(3)}</span>
          </div>
          <div className="bg-slate-950/60 p-1 rounded-lg border border-emerald-500/30 text-emerald-400">
            <span className="block font-bold">Y (|+i⟩/|-i⟩)</span>
            <span>{coordinates.y.toFixed(3)}</span>
          </div>
          <div className="bg-slate-950/60 p-1 rounded-lg border border-sky-500/30 text-sky-400">
            <span className="block font-bold">Z (|0⟩/|1⟩)</span>
            <span>{coordinates.z.toFixed(3)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
