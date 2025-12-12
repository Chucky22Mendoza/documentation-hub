import { getProjectData } from '@/app/actions';
import { buildDocTree, findNodeByPath, flattenTree } from '@/lib/docs';
import { notFound, redirect } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileCode, Link as LinkIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ProjectActions } from '@/components/project-actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default async function DocPage({
  params
}: {
  params: { project: string; slug?: string[] };
}) {
  const data = await getProjectData(params.project);
  if (!data) return notFound();

  const tree = buildDocTree(data.pages);

  if (!params.slug || params.slug.length === 0) {
    const flat = flattenTree(tree);
    if (flat.length > 0) {
      redirect(`/docs/${params.project}/${flat[0].path}`);
    }
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Page of documentation not found</h1>
        <div className="mt-4">
          <ProjectActions slug={params.project} />
        </div>
      </div>
    );
  }

  const node = findNodeByPath(tree, params.slug);

  if (!node) {
    return notFound();
  }

  return (
    <div className="xl:grid xl:grid-cols-[1fr_250px] gap-10 px-4 md:px-0 max-w-full">
      <div className="min-w-0 mx-auto w-full">
        <div className="mb-4 flex justify-end border-b pb-4">
          <ProjectActions slug={params.project} />
        </div>
        <div className="mb-8 space-y-4">
          <h1 id="overview" className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
            {node.title}
          </h1>
          {node.purpose && (
            <div id="details">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {node.purpose}
              </p>
            </div>
          )}
        </div>

        <Separator className="my-8" />

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-m-20 prose-headings:tracking-tight prose-p:leading-7 prose-li:my-0">
          {node.page_notes.map((note, idx) => (
            <div key={idx} className="mb-10">
              {note.title && (
                <h3 id={`section-${idx}`} className="text-2xl font-semibold tracking-tight mb-4 flex items-center gap-2 group cursor-pointer">
                  {note.title}
                  <LinkIcon className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                </h3>
              )}
              {note.content ? (
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {note.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-sm border-l-2 pl-4">[Content of {node.title}]</p>
              )}
            </div>
          ))}
        </div>

        {/* References Section */}
        {node.references && node.references.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Key references
            </h3>
            <div className="grid gap-3">
              {node.references.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors font-mono text-sm text-muted-foreground hover:text-primary cursor-pointer group"
                >
                  <div className="h-2 w-2 rounded-full bg-indigo-500/50 group-hover:bg-indigo-500" />
                  {ref.placeholder}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 flex flex-row items-center justify-between border-t pt-8">
          {(() => {
            const flat = flattenTree(tree);
            const currentIndex = flat.findIndex(n => n.slug === node.slug);
            const prevNode = currentIndex > 0 ? flat[currentIndex - 1] : null;
            const nextNode = currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null;

            return (
              <>
                <div className="flex-1 min-w-0">
                  {prevNode && (
                    <Link href={`/docs/${params.project}/${prevNode.path}`} className="group flex flex-col gap-1 pr-4 transition-colors hover:text-foreground">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Previous
                      </div>
                      <div className="font-medium text-foreground truncate pl-5">
                        {prevNode.title}
                      </div>
                    </Link>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-right">
                  {nextNode && (
                    <Link href={`/docs/${params.project}/${nextNode.path}`} className="group flex flex-col gap-1 pl-4 transition-colors hover:text-foreground items-end">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground group-hover:text-foreground">
                        Next
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                      <div className="font-medium text-foreground truncate pr-5">
                        {nextNode.title}
                      </div>
                    </Link>
                  )}
                </div>
              </>
            )
          })()}
        </div>
      </div>

      <div className="hidden text-sm xl:block">
        <div className="sticky top-20 h-[calc(100vh-3.5rem)] overflow-hidden pt-6">
          <ScrollArea className="h-full pb-10">
            <div className="space-y-4 border-l pl-4 border-border/60">
              <h4 className="font-semibold text-sm text-foreground mb-4">On this page</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <a href="#overview" className="block hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-primary/50">{node.title}</a>
                </li>
                {node.page_notes.map((note, idx) => (
                  note.title ? (
                    <li key={idx}>
                      <a href={`#section-${idx}`} className="block hover:text-foreground transition-colors hover:underline underline-offset-4 decoration-primary/50">
                        {note.title}
                      </a>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
