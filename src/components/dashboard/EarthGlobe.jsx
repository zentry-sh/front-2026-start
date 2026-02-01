import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function EarthGlobe({ markers = [], focusOn }) {
  const mountRef = useRef(null);

  // We use refs for values modified inside the animation loop
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const globeGroupRef = useRef(null);
  const markerGroupRef = useRef(null);

  // Scene Setup
  useEffect(() => {
    let renderer, scene, camera, controls, globe, animationId;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // ... Shared Helpers ...
    const latLonToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // ... Init Scene ...
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controls.enablePan = false;

    // Sun setup (same as before)
    const calculateSunPosition = () => {
      const now = new Date();
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      const declination = 23.44 * Math.sin((360 / 365) * (dayOfYear - 81) * (Math.PI / 180));
      const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
      const sunLon = (12 - utcHours) * 15;
      return latLonToVector3(declination, sunLon, 10);
    };
    const initialSunPos = calculateSunPosition();

    const sun = new THREE.DirectionalLight("#ffffff", 2);
    sun.position.copy(initialSunPos);
    scene.add(sun);
    const ambient = new THREE.AmbientLight("#ffffff", 0.1);
    scene.add(ambient);

    // Textures
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = textureLoader.load("/textures/planets/earth_day_4096.jpg");
    const nightTexture = textureLoader.load("/textures/planets/earth_night_4096.jpg");
    const bumpTexture = textureLoader.load("/textures/planets/earth_bump_roughness_clouds_4096.jpg");

    // Groups
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    // Save ref for animation
    globeGroupRef.current = globeGroup;

    // Globe Mesh
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        bumpTexture: { value: bumpTexture },
        sunDirection: { value: initialSunPos.clone().normalize() },
      },
      vertexShader: `
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                void main() {
                    vUv = uv;
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = - mvPosition.xyz;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
      fragmentShader: `
                uniform sampler2D dayTexture;
                uniform sampler2D nightTexture;
                uniform vec3 sunDirection;
                varying vec2 vUv;
                varying vec3 vNormal;
                void main() {
                    vec3 sunDirView = normalize((viewMatrix * vec4(sunDirection, 0.0)).xyz);
                    float intensity = dot(vNormal, sunDirView);
                    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
                    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
                    float mixVal = smoothstep(-0.2, 0.2, intensity);
                    float diffuse = max(0.0, intensity);
                    vec3 litDay = dayColor * (0.1 + 0.9 * diffuse);
                    vec3 finalColor = mix(nightColor, litDay, mixVal);
                    gl_FragColor = vec4(finalColor, 1.0);
                }
            `
    });
    globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);

    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);
    markerGroupRef.current = markerGroup;

    // State for animation
    const clock = new THREE.Clock();

    // Animate
    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const target = targetRotationRef.current;

      if (globeGroupRef.current) {
        // Shortest path interpolation
        let dy = target.y - globeGroupRef.current.rotation.y;
        while (dy > Math.PI) dy -= 2 * Math.PI;
        while (dy < -Math.PI) dy += 2 * Math.PI;
        globeGroupRef.current.rotation.y += dy * 0.05;

        let dx = target.x - globeGroupRef.current.rotation.x;
        globeGroupRef.current.rotation.x += dx * 0.05;
      }

      // Animate Markers (Pulse effect)
      if (markerGroupRef.current) {
        markerGroupRef.current.children.forEach(marker => {
          if (marker.userData.highlight) {
            // Pulsing ring
            const ring = marker.getObjectByName('pulseRing');
            if (ring) {
              const scale = 1 + Math.sin(elapsed * 3) * 0.3;
              ring.scale.set(scale, scale, scale);
              ring.material.opacity = 0.5 - Math.sin(elapsed * 3) * 0.2;
            }
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Effect: Update Markers
  useEffect(() => {
    const group = markerGroupRef.current;
    if (!group) return;

    // Clear old markers
    while (group.children.length > 0) {
      const child = group.children[0];
      // Dispose logic...
      group.remove(child);
    }

    // Add new markers
    markers.forEach((m) => {
      const markerObj = new THREE.Group();
      markerObj.userData = { highlight: m.highlight };

      // 1. The Pin (Cylinder + Sphere)
      const color = m.highlight ? 0xef4444 : 0x3b82f6; // Red for active, Blue for others

      // Pin Shaft
      const shaftGeom = new THREE.CylinderGeometry(0.005, 0.002, 0.1, 8);
      shaftGeom.translate(0, 0.05, 0); // Pivot at bottom
      const shaftMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const shaft = new THREE.Mesh(shaftGeom, shaftMat);

      // Pin Head
      const headGeom = new THREE.SphereGeometry(0.025, 16, 16);
      headGeom.translate(0, 0.1, 0);
      const headMat = new THREE.MeshBasicMaterial({ color: color });
      const head = new THREE.Mesh(headGeom, headMat);

      markerObj.add(shaft);
      markerObj.add(head);

      // 2. Pulsing Ring (Only for highlight)
      if (m.highlight) {
        const ringGeom = new THREE.RingGeometry(0.03, 0.04, 32);
        // Rotate to lie flat vs the normal
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.name = 'pulseRing';
        markerObj.add(ring);
      }

      // Position on Globe
      const phi = (90 - m.lat) * (Math.PI / 180);
      const theta = (m.lon + 180) * (Math.PI / 180);
      const x = -(1 * Math.sin(phi) * Math.cos(theta));
      const z = 1 * Math.sin(phi) * Math.sin(theta);
      const y = 1 * Math.cos(phi);

      markerObj.position.set(x, y, z);
      markerObj.lookAt(new THREE.Vector3(0, 0, 0)); // Point inward
      // Rotate 180 deg to point outward because Cylinder points up y
      // Actually lookAt points Z axis. 
      // Let's rely on quaternion calculation to be safe or manual rotation
      // Standard LookAt makes +Z face the target.
      // We want the vector (x,y,z) which is "Out" to be the UP of our marker, 
      // OR aligns with the Y axis of the marker group.

      const normal = new THREE.Vector3(x, y, z).normalize();
      markerObj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      group.add(markerObj);
    });

  }, [markers]);

  // Effect: Update Focus (Rotation) - Keep logic, logic checks ref
  useEffect(() => {
    if (focusOn) {
      const latRad = focusOn.lat * (Math.PI / 180);
      const lonRad = focusOn.lon * (Math.PI / 180);
      targetRotationRef.current = {
        y: -lonRad - Math.PI / 2,
        x: latRad
      };
    }
  }, [focusOn]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", background: "transparent", borderRadius: "12px" }}
    />
  );
}
