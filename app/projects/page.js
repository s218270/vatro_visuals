import { getProjects } from "@/lib/getProjects";
import Image from "next/image";
import Link from "next/link";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="min-h-screen bg-black text-white p-8 pt-32">
      {/* Przycisk cofania pod navbarem */}
      <div className="fixed top-24 left-4 z-40">
        <div className="button-border-wrapper">
          <a
            href="/"
            className="button-border-content bg-black p-4 rounded-full"
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="glitch-text-white"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6 text-white"
                style={{ transform: "rotate(180deg)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
            <span
              className="glitch-text-purple"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-6 h-6 text-[#a259f7]"
                style={{ transform: "rotate(180deg)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </a>
          <div className="border-line border-white-1"></div>
          <div className="border-line border-white-2"></div>
          {/* White Glow */}
          <div className="border-white-glow-top"></div>
          <div className="border-white-glow-right"></div>
          <div className="border-white-glow-bottom"></div>
          <div className="border-white-glow-left"></div>
          <div className="border-line border-purple-1"></div>
          <div className="border-line border-purple-2"></div>
          {/* Purple Glow */}
          <div className="border-purple-glow-top"></div>
          <div className="border-purple-glow-right"></div>
          <div className="border-purple-glow-bottom"></div>
          <div className="border-purple-glow-left"></div>
        </div>
      </div>
      <h1 className="text-4xl font-bold mb-8 text-center">All Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {projects.map((project) => (
          <a
            key={project.id}
            href={`/projects/${project.id}`}
            className="group relative block overflow-hidden rounded-lg transition-transform hover:scale-105"
          >
            <div className="relative h-64">
              {project.mainImage && (
                <Image
                  src={project.mainImage}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
            </div>
            <div className="p-4 bg-black/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-300">{project.shortDescription}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
