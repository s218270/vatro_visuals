"use client";

export default function Section3({ speed, scrollToSection }) {
  return (
    <section
      id="section3"
      className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden"
    >
      <h1 className="text-white text-4xl mb-8">Sliding Typography Animation</h1>
      <div className="w-full h-full overflow-hidden relative">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`absolute whitespace-nowrap`}
            style={{
              top: `${index * 20}%`,
              animation: `scroll ${speed - index * 2}s linear infinite ${
                index % 2 === 0 ? "normal" : "reverse"
              }`,
            }}
          >
            {"VATRO ".repeat(50)}
          </div>
        ))}
      </div>
      <button
        onClick={() => scrollToSection("section4")}
        className="absolute bottom-10 bg-white p-4 rounded-full hover:bg-gray-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6 text-black"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </section>
  );
}