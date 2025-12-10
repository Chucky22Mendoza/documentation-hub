import { getProjectData, buildDocTree } from '@/lib/docs';
import { DesktopSidebar, MobileSidebar } from '@/components/docs-sidebar';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function DocsLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { project: string };
}) {
  const data = await getProjectData(params.project);
  if (!data) return notFound();

  const tree = buildDocTree(data.pages);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4 md:px-8">
          <MobileSidebar nodes={tree} projectName={params.project} />
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2 font-bold" href="/">
              Documentation Hub
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <span className="text-foreground/60 transition-colors hover:text-foreground/80 cursor-default capitalize">{params.project.replace(/-/g, ' ')}</span>
            </nav>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8">
        <DesktopSidebar nodes={tree} projectName={params.project} />
        <main className="relative py-6 lg:gap-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
