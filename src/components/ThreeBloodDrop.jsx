import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBloodDrop = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 360;
    const height = currentMount.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    currentMount.appendChild(renderer.domElement);

    // 2. Teardrop / Blood Drop Geometry using Lathe
    const points = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 (bottom) to 1 (top tip)
      // Parametric curve for teardrop profile
      const y = (t - 0.5) * 3.2; // vertical position
      // Width function: rounded belly near bottom, tapering to 0 at tip
      const r = Math.sin(Math.PI * t) * Math.pow(1 - t * 0.85, 0.45) * 1.35;
      points.push(new THREE.Vector2(Math.max(0, r), -y));
    }

    const dropGeometry = new THREE.LatheGeometry(points, 64);
    dropGeometry.computeVertexNormals();

    // 3. Luxurious Crimson Glass / Liquid Material
    const dropMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xD7263D,
      emissive: 0x4A000A,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transmission: 0.6,
      ior: 1.45,
      thickness: 1.8,
      specularIntensity: 1.5
    });

    const dropMesh = new THREE.Mesh(dropGeometry, dropMaterial);
    dropMesh.rotation.z = Math.PI; // Orient pointed tip upward
    dropMesh.position.y = 0.2;
    scene.add(dropMesh);

    // Inner glowing core
    const coreGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF4D6D,
      transparent: true,
      opacity: 0.45
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreMesh.position.y = -0.2;
    dropMesh.add(coreMesh);

    // 4. Floating Micro-Platelets / Sparkles
    const particleCount = 28;
    const particleGeometry = new THREE.SphereGeometry(0.045, 12, 12);
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFE5EC,
      emissive: 0xD7263D,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
      const angle = (i / particleCount) * Math.PI * 2 + Math.random();
      const radius = 1.9 + Math.random() * 1.4;
      const py = (Math.random() - 0.5) * 3.5;
      mesh.position.set(Math.cos(angle) * radius, py, Math.sin(angle) * radius);
      mesh.userData = {
        angle,
        radius,
        speed: 0.008 + Math.random() * 0.012,
        yOffset: py,
        bobSpeed: 1 + Math.random() * 2
      };
      scene.add(mesh);
      particles.push(mesh);
    }

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.9);
    scene.add(ambientLight);

    const primaryLight = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    primaryLight.position.set(4, 5, 5);
    scene.add(primaryLight);

    const rimLight = new THREE.PointLight(0x2A9D8F, 3.5, 10);
    rimLight.position.set(-4, -2, -2);
    scene.add(rimLight);

    const redGlow = new THREE.PointLight(0xD7263D, 4, 8);
    redGlow.position.set(2, -3, 3);
    scene.add(redGlow);

    // 6. Interactive Mouse Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event) => {
      const rect = currentMount.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.5;
      targetRotationX = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop with Heartbeat Pulse
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Heartbeat pulse simulation
      const pulse = 1 + Math.sin(elapsed * 2.8) * 0.035 + (Math.sin(elapsed * 5.6) > 0.8 ? 0.02 : 0);
      dropMesh.scale.set(pulse, pulse, pulse);

      // Continuous gentle rotation + mouse tracking lerp
      dropMesh.rotation.y += 0.008;
      dropMesh.rotation.x += (targetRotationX - dropMesh.rotation.x) * 0.05;

      // Animate floating particles
      particles.forEach((p) => {
        p.userData.angle += p.userData.speed;
        p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
        p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
        p.position.y = p.userData.yOffset + Math.sin(elapsed * p.userData.bobSpeed) * 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      dropGeometry.dispose();
      dropMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] lg:h-[480px] flex items-center justify-center">
      {/* Background radial glowing ambient ring */}
      <div className="absolute w-72 h-72 rounded-full bg-crimson-red/15 blur-3xl -z-10 pointer-events-none animate-pulse-glow" />
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {/* Floating 3D Badge */}
      <div className="absolute bottom-4 left-6 lg:left-12 px-4 py-2 rounded-xl bg-white/70 backdrop-blur-md border border-white/50 shadow-md text-xs font-semibold text-slate-800 flex items-center gap-2 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        Live 3D Plasma Visualization
      </div>
    </div>
  );
};

export default ThreeBloodDrop;
