
import { getAllProjectsMetadata } from '@/app/actions';
import { ProjectList } from '@/components/project-list';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  const projects = await getAllProjectsMetadata();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-2xl mx-auto flex h-16 items-center px-6 justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Logo className="h-6 w-6 text-primary" />
            </div>
            <div className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Documentation Hub
            </div>
          </div>
          <Link href="/editor">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Documentation
            </Button>
          </Link>
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
