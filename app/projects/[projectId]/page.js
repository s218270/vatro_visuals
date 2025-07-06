import { getProjectById } from "@/lib/getProjectById";
import { getProjects } from "@/lib/getProjects";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({
    projectId: project.id.toString(),
  }));
}

export default async function ProjectPage({ params }) {
  const project = await getProjectById(params.projectId);
  if (!project) notFound();

  return (
    <>
      <div className="min-h-screen bg-black text-white p-8 pt-32">
        {/* Przycisk cofania pod navbarem */}
        <div className="fixed top-24 left-4 z-40">
          <div className="button-border-wrapper">
            <a
              href="/projects"
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="relative h-96">
                {project.mainImage && (
                  <Image
                    src={project.mainImage}
                    alt={project.title}
                    fill
                    className="object-cover rounded-lg"
                    priority
                  />
                )}
              </div>
              {project.files && project.files.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {project.files.map((file, idx) => (
                    <div key={idx} className="relative h-48">
                      {file.path && file.path.referencePath && (
                        <Image
                          src={
                            file.path.referencePath.startsWith("http")
                              ? file.path.referencePath
                              : `https://firebasestorage.googleapis.com/v0/b/${file.path.referencePath.replace(
                                  ".firebasestorage.app",
                                  ".appspot.com"
                                )}?alt=media`
                          }
                          alt={file.description || `File ${idx + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2">
                        {file.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Project Details</h2>
                <div className="space-y-2">
                  {project.client && (
                    <p>
                      <strong>Client:</strong> {project.client}
                    </p>
                  )}
                  {project.date && project.date.seconds && (
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(
                        project.date.seconds * 1000
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="leading-relaxed">
                  {project.fullDescription || project.fullDesctiption}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
