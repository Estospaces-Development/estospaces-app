import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { VirtualTourScene } from '../../mocks/virtualTourMock'; // Adjust path as needed
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface VirtualTourViewer3DProps {
    scene: VirtualTourScene;
    onHotspotClick: (targetSceneId: string) => void;
    initialRotation?: { x: number; y: number };
}

const VirtualTourViewer3D: React.FC<VirtualTourViewer3DProps> = ({
    scene,
    onHotspotClick,
    initialRotation = { x: 0, y: 0 }
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Scene
        const scene3D = new THREE.Scene();
        sceneRef.current = scene3D;

        // Initialize Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0, 0.1); // Inside the sphere
        cameraRef.current = camera;

        // Initialize Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        // Important for EXR (HDR)
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Initialize Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = -0.5; // Invert drag for "looking around" feel
        controls.enableZoom = true;
        controls.zoomSpeed = 1.2;
        controls.maxDistance = 1; // Keep inside
        controls.minDistance = 0.1;
        controlsRef.current = controls;

        // Handle Window Resize
        const handleResize = () => {
            if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            cameraRef.current.aspect = width / height;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(width, height);
        };
        window.addEventListener('resize', handleResize);

        // Animation Loop
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
            updateHotspotPositions();
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            if (containerRef.current && rendererRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
            }
            renderer.dispose();
            controls.dispose();
        };
    }, []);

    // Load Texture when scene changes
    useEffect(() => {
        if (!sceneRef.current || !scene.panoramaUrl) return;

        setLoading(true);
        setError(null);

        // Clear previous mesh
        while (sceneRef.current.children.length > 0) {
            sceneRef.current.remove(sceneRef.current.children[0]);
        }

        const loadTexture = () => {
            if (scene.type === 'exr') {
                const loader = new EXRLoader();
                loader.load(
                    scene.panoramaUrl,
                    (texture) => {
                        texture.mapping = THREE.EquirectangularReflectionMapping;

                        // Create Sphere
                        const geometry = new THREE.SphereGeometry(500, 60, 40);
                        geometry.scale(-1, 1, 1); // Invert scale to view from inside

                        const material = new THREE.MeshBasicMaterial({ map: texture });
                        const mesh = new THREE.Mesh(geometry, material);

                        sceneRef.current?.add(mesh);
                        setLoading(false);

                        // Set initial rotation if provided
                        if (cameraRef.current && initialRotation) {
                            // Simple lookAt not enough, set controls or rotation
                            // Reset controls?
                        }

                    },
                    (xhr) => {
                        // console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                    },
                    (err) => {
                        console.error('An error occurred loading EXR', err);
                        setError('Failed to load high-quality 360 view');
                        setLoading(false);
                    }
                );
            } else {
                // Fallback for standard images (JPG/PNG)
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(
                    scene.panoramaUrl,
                    (texture) => {
                        const geometry = new THREE.SphereGeometry(500, 60, 40);
                        geometry.scale(-1, 1, 1);
                        const material = new THREE.MeshBasicMaterial({ map: texture });
                        const mesh = new THREE.Mesh(geometry, material);
                        sceneRef.current?.add(mesh);
                        setLoading(false);
                    },
                    undefined,
                    (err) => {
                        console.error('Error loading texture', err);
                        setError('Failed to load 360 view');
                        setLoading(false);
                    }
                );
            }
        };

        loadTexture();

    }, [scene]);

    // Hotspot Logic (Projecting 3D positions to 2D overlay)
    const [hotspotPositions, setHotspotPositions] = useState<{ id: string, x: number, y: number, visible: boolean }[]>([]);

    const updateHotspotPositions = () => {
        if (!cameraRef.current || !containerRef.current) return;

        // This is a simplified hotspot implementation mapping simple percent coordinates to 3D sphere coords
        // For a full implementation, we'd calculate vectors.
        // Given the requirement is to use the EXISTING hotspot data structure {x, y} which are percentages...
        // We will project these spherical coordinates.
        // x=0 is left, x=100 is right (longitude). y=0 is top, y=100 is bottom (latitude).
    };

    // NOTE: The current hotspot data {x, y} is tailored for a flat equirectangular projection viewer (2D image scroll).
    // Mapping 2D texture coordinates to 3D world space for HTML overlay is complex without modifying data.
    // For this task, we will try to raycast or use a transparent sprite in 3D scene would be better 
    // BUT we want to reuse the HTML buttons for styling.

    // Let's create Three.js Sprites for hotspots instead of HTML overlay for better sync
    useEffect(() => {
        if (!sceneRef.current || !scene.hotspots) return;

        // Remove old hotspots (sprites) - assuming they are the specific type of object we add
        // For simplicity, we just clear and re-add mesh. Ideally we manage a group.

        // Let's add a Hotspot Group
        const hotspotGroup = new THREE.Group();
        sceneRef.current.add(hotspotGroup);

        scene.hotspots.forEach(hotspot => {
            // Convert percent x,y to spherical coordinates
            // x: 0-100% -> 0 to 2PI
            // y: 0-100% -> 0 to PI (from top)

            const phi = THREE.MathUtils.degToRad(90 - (hotspot.position.y / 100 * 180 - 90)); // vertical
            const theta = THREE.MathUtils.degToRad(hotspot.position.x / 100 * 360); // horizontal (adjust offset if needed)

            const radius = 400; // slightly smaller than sphere

            // Spherical to Cartesian
            const x = radius * Math.sin(phi) * Math.cos(theta); // z/x swapped depending on coordinate system
            const y = radius * Math.cos(phi);
            const z = radius * Math.sin(phi) * Math.sin(theta);

            // Create Sprite
            const map = new THREE.TextureLoader().load('/hotspot-icon.png'); // Need an icon, or generate one
            // Using a simple circle geometry color for now if no sprite

            // Let's make a clickable Mesh instead used as a hotspot
            const geometry = new THREE.CircleGeometry(15, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0xff6b00,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const circle = new THREE.Mesh(geometry, material);

            // Position
            circle.position.set(-x, y, z); // Invert x for internal view consistency
            circle.lookAt(0, 0, 0); // Face center

            // Add user data for click handler
            circle.userData = { isHotspot: true, targetId: hotspot.targetSceneId, label: hotspot.label };

            hotspotGroup.add(circle);
        });

        return () => {
            sceneRef.current?.remove(hotspotGroup);
        };

    }, [scene]);

    // Raycaster for clicks
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseClick = (event: React.MouseEvent) => {
        if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, cameraRef.current);

        // Find intersections in the hotspot group (we'd need to track it properly)
        // For now, intersecting strictly with Meshes that have userData
        const intersects = raycaster.intersectObjects(sceneRef.current.children, true);

        for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].object.userData.isHotspot) {
                onHotspotClick(intersects[i].object.userData.targetId);
                return;
            }
        }
    };


    return (
        <div ref={containerRef} className="w-full h-full relative" onClick={handleMouseClick}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                        <p>Loading High-Quality Experience...</p>
                    </div>
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
                    <p className="text-red-500">{error}</p>
                </div>
            )}

            {/* Simple Overlay for Hotspot Labels (Optional - difficult to sync perfectly without projection loop) */}
        </div>
    );
};

export default VirtualTourViewer3D;
