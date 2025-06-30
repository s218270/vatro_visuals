'use client';
import Spline from '@splinetool/react-spline';

export default function Section1({ scrollToSection }) {
  return (
    <section id='section1' className="h-[100vh] w-full bg-black flex flex-col items-center justify-center relative">
      {/* Spline component */}
      <Spline 
        scene="https://prod.spline.design/pTIx4XijW9g3zqmI/scene.splinecode" 
        className="w-full h-full"
      />

      {/* Gradient overlay */}
      {/* <div className="absolute top-0 left-0 w-full h-16 bg-black z-10">
      </div> */}
      <div className="absolute top-0 left-0 w-full h-[20%] 
        bg-gradient-to-b from-black to-transparent z-10">
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[20%] 
        bg-gradient-to-t from-black to-transparent z-10">
      </div>

      {/* Scroll button */}
      <button
  onClick={() => scrollToSection("section3")}
  className="
    sticky z-20 bottom-10
    bg-transparent text-white p-4 
    rounded-full
    group
    border-2 border-transparent
  "
>
  {/* Wrapper needs relative for absolute children */}
  <div className="relative w-full h-full">
    {/* Animated Border Wrapper */}
    <div className="
      absolute -inset-0.5
      rounded-full
      overflow-hidden
      pointer-events-none
    ">
      {/* Animated Border Element */}
      <div className="
        absolute top-0 left-0 w-full h-full
        border-2 border-white
        rounded-full
        opacity-0
        group-hover:opacity-100
        group-hover:animate-[border-draw_1.5s_cubic-bezier(0.4,0,0.2,1)_forwards]
        transition-opacity duration-300
      " />
    </div>

    {/* SVG Arrow */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-7 h-6 relative z-10"  // Correct relative here
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 9l-8 7-8-7"
      />
    </svg>
  </div>
</button>
    </section>
  );
}


// 'use client';

// import dynamic from 'next/dynamic';
// import { Suspense } from 'react';

// // Correct dynamic import
// const Spline = dynamic(
//   () => import('@splinetool/react-spline'),
//   {
//     ssr: false,
//     loading: () => <div className="text-white">Loading scene...</div>
//   }
// );

// function Section1({ scrollToSection }) {
//   return (
//     <section
//       id="section1"
//       className="h-screen w-full bg-black flex flex-col items-center justify-center relative"
//     >
//       <Suspense fallback={<div className="text-white">Loading 3D scene...</div>}>
//         <div className="w-full h-full">
//           <Spline
//             scene="https://prod.spline.design/pTIx4XijW9g3zqmI/scene.splinecode"
//             className="w-full h-full"
//           />
//         </div>
//       </Suspense>

//       <button
//         onClick={() => scrollToSection("section2")}
//         className="absolute z-20 bottom-10 bg-black p-4 rounded-full hover:bg-gray-700 transition-colors duration-300"
//       >
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//           strokeWidth="2"
//           stroke="currentColor"
//           className="w-6 h-6 text-white"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </button>
//     </section>
//   );
// }

// export default Section1;