import { cardDetails } from "@/config/carousel-config";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return cardDetails.map((project) => ({
    projectId: project.id.toString(),
  }));
}

export default function ProjectPage({ params }) {
  const project = cardDetails.find(p => p.id.toString() === params.projectId);
  
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{project.title}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="relative h-96">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {project.details.images.map((img, index) => (
                <div key={index} className="relative h-48">
                  <Image
                    src={img}
                    alt={`${project.title} - ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Project Details</h2>
              <div className="space-y-2">
                <p><strong>Client:</strong> {project.details.client}</p>
                <p><strong>Date:</strong> {project.details.date}</p>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="leading-relaxed">{project.details.fullDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}