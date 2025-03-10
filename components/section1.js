import React from 'react'

function section1() {
  return (
    <><h1 className="text-white text-4xl">Section 1</h1>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 500"
      style={{ backgroundColor: "black", width: "100%", height: "100%" }}
    >
      <path
        d="M0,270 L100,270 L220,450 L320,270 L1000,270" 
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeDasharray="1200"
        strokeDashoffset="1200"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="1200"
          to="0"
          dur="1s"
          begin="0s"
          fill="freeze"
        />
      </path>

      <path
        d="M0,400 L350,400 L400,300 L450,400 L1000,400 M375,350 L425,350"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeDasharray="1200"
        strokeDashoffset="1200"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="1200"
          to="0"
          dur="1s"
          begin="1s"
          fill="freeze"
        />
      </path>

      <path
        d="M0,285 L500,285 L600,285 L1000,285 M550,285 L550,400" 
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeDasharray="1200"
        strokeDashoffset="1200"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="1200"
          to="0"
          dur="1s"
          begin="2s"
          fill="freeze"
        />
      </path>

      <path
        d="M650,400 L650,300 L700,300 Q750,300 750,350 L700,350 Q650,350 700,400"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeDasharray="400"
        strokeDashoffset="400"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="400"
          to="0"
          dur="1s"
          begin="3s"
          fill="freeze"
        />
      </path>

      <path
        d="M800,350 Q800,300 850,300 Q900,300 900,350 Q900,400 850,400 Q800,400 800,350"
        stroke="white"
        strokeWidth="4"
        fill="none"
        strokeDasharray="400"
        strokeDashoffset="400"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="400"
          to="0"
          dur="1s"
          begin="4s"
          fill="freeze"
        />
      </path>
    </svg>
    </>
  )
}

export default section1