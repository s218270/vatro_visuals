import { cardDetails } from "@/config/carousel-config";
import Image from "next/image";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">All Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cardDetails.map((project) => (
          <Link 
            key={project.id}
            href={`/projects/${project.id}`}
            className="group relative block overflow-hidden rounded-lg transition-transform hover:scale-105"
          >
            <div className="relative h-64">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4 bg-black/80 backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-300">{project.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}