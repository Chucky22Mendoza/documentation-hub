import { getAllProjectsMetadata } from '@/lib/docs';
import { ProjectList } from '@/components/project-list';

export default async function HomePage() {
  const projects = await getAllProjectsMetadata();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-2xl mx-auto flex h-16 items-center px-6">
          <div className="mr-6 flex items-center space-x-2 font-bold">
            Documentation Hub
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto py-12 px-6">
        <div className="mb-10 space-y-2">
          <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Projects</h2>
          <p className="text-lg text-muted-foreground">
            Access to complete documentation for team projects.
          </p>
        </div>

        <ProjectList initialProjects={projects} />
      </main>
    </div>
  );
}
