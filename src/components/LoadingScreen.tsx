// // components/LoadingScreen.tsx
// 'use client';

// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import { Typewriter } from 'react-simple-typewriter';
// import { useEffect, useRef } from 'react';
// interface LoadingScreenProps {
//   progress: number;
// }

// const LoadingScreen = ({ progress }: LoadingScreenProps) => {
//   const canvasContainerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     let animationFrameId = 0;
//     let cleanup = () => {};

//     const init = async () => {
//       const container = canvasContainerRef.current;
//       if (!container) return;

//       const THREE = await import('three');
//       const {
//         Scene,
//         PerspectiveCamera,
//         WebGLRenderer,
//         Color,
//         FogExp2,
//         BufferGeometry,
//         Float32BufferAttribute,
//         PointsMaterial,
//         Points,
//         Vector3,
//         Clock,
//       } = THREE as any;

//       const scene = new Scene();
//       // Keep canvas transparent; parent provides white tone
//       scene.background = null;
//       scene.fog = new FogExp2(new Color(0x000000), 0.015);

//       const camera = new PerspectiveCamera(
//         60,
//         container.clientWidth / container.clientHeight,
//         1,
//         1000,
//       );
//       camera.position.z = 140;

//       const renderer = new WebGLRenderer({ antialias: true, alpha: true });
//       renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//       renderer.setSize(container.clientWidth, container.clientHeight);
//       renderer.setClearColor(0xffffff, 0); // transparent over white parent
//       container.appendChild(renderer.domElement);

//       // Generate monochrome particle field
//       const particleCount = 1000;
//       const radius = 120;
//       const positions = new Float32BufferAttribute(particleCount * 3, 3);
//       const velocities: number[] = [];

//       for (let i = 0; i < particleCount; i++) {
//         const v = new Vector3()
//           .randomDirection()
//           .multiplyScalar(Math.random() * radius);
//         positions.setXYZ(i, v.x, v.y, v.z);
//         velocities.push((Math.random() - 0.5) * 0.1);
//       }

//       const geometry = new BufferGeometry();
//       geometry.setAttribute('position', positions);

//       const material = new PointsMaterial({
//         color: 0x111111,
//         size: 1.6,
//         sizeAttenuation: true,
//         transparent: true,
//         opacity: 0.85,
//       });
//       const points = new Points(geometry, material);
//       scene.add(points);

//       const clock = new Clock();
//       const animate = () => {
//         const elapsed = clock.getElapsedTime();
//         points.rotation.y += 0.0008;
//         points.rotation.x = Math.sin(elapsed * 0.15) * 0.15;

//         const pos = geometry.getAttribute('position') as any;
//         for (let i = 0; i < particleCount; i++) {
//           const y = pos.getY(i);
//           pos.setY(i, y + velocities[i]);
//           if (pos.getY(i) > radius || pos.getY(i) < -radius)
//             velocities[i] *= -1;
//         }
//         pos.needsUpdate = true;

//         renderer.render(scene, camera);
//         animationFrameId = requestAnimationFrame(animate);
//       };
//       animate();

//       const handleResize = () => {
//         if (!container) return;
//         camera.aspect = container.clientWidth / container.clientHeight;
//         camera.updateProjectionMatrix();
//         renderer.setSize(container.clientWidth, container.clientHeight);
//       };
//       window.addEventListener('resize', handleResize);

//       cleanup = () => {
//         cancelAnimationFrame(animationFrameId);
//         window.removeEventListener('resize', handleResize);
//         scene.remove(points);
//         geometry.dispose();
//         material.dispose();
//         renderer.dispose();
//         if (
//           renderer.domElement &&
//           renderer.domElement.parentNode === container
//         ) {
//           container.removeChild(renderer.domElement);
//         }
//       };
//     };

//     init();
//     return () => cleanup();
//   }, []);

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         transition={{ duration: 0.5 }}
//         className="fixed inset-0 z-50"
//       >
//         {/* Three.js canvas layer */}
//         <div ref={canvasContainerRef} className="absolute inset-0" />

//         {/* Foreground content */}
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[1px]">
//           {/* Logo với animation */}
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             className="mb-8"
//           >
//             {/* <svg
//             width="120"
//             height="120"
//             viewBox="0 0 120 120"
//             className="filter grayscale"
//           >
//             <circle
//               cx="60"
//               cy="60"
//               r="55"
//               stroke="black"
//               strokeWidth="4"
//               fill="none"
//             />
//             <path
//               d="M40 40 L80 80 M80 40 L40 80"
//               stroke="black"
//               strokeWidth="4"
//             />
//           </svg> */}
//             <Image
//               src="https://i.pinimg.com/1200x/ca/69/f4/ca69f40dafd9d67fa1443d8fcca5a8f6.jpg"
//               alt="logo"
//               width={250}
//               height={250}
//             />
//           </motion.div>

//           {/* Text */}
//           <motion.h2
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//             className="text-2xl font-bold mb-6 text-black"
//           >
//             ĐANG TẢI
//           </motion.h2>

//           {/* Progress bar */}
//           <motion.div
//             initial={{ width: 0 }}
//             animate={{ width: '300px' }}
//             transition={{ duration: 0.5, delay: 0.6 }}
//             className="h-2 bg-gray-200 rounded-full mb-4 overflow-hidden"
//           >
//             <div
//               className="h-full bg-black transition-all duration-300 ease-out"
//               style={{ width: `${progress}%` }}
//             />
//           </motion.div>

//           {/* Percentage */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.8 }}
//             className="flex items-center"
//           >
//             <span className="text-lg font-medium mr-3 text-black">
//               {Math.round(progress)}%
//             </span>
//             {/* Spinner CSS animation */}
//             <div className="flex space-x-1">
//               {[0, 1, 2].map((i) => (
//                 <motion.div
//                   key={i}
//                   animate={{ y: [0, -10, 0] }}
//                   transition={{
//                     duration: 0.6,
//                     repeat: Infinity,
//                     delay: i * 0.2,
//                   }}
//                   className="w-2 h-2 bg-black rounded-full"
//                 />
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// };

// export default LoadingScreen;
