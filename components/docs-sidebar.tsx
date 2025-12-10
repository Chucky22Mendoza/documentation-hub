"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { DocNode } from '@/lib/docs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  nodes: DocNode[];
  projectName: string;
}

export function DesktopSidebar({ nodes, projectName }: SidebarProps) {
  const pathname = usePathname();
  const prefix = `/docs/${projectName}`;

  return (
    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
      <ScrollArea className="h-full py-6 pr-6 lg:py-8">
        <SidebarContent nodes={nodes} pathname={pathname} prefix={prefix} />
      </ScrollArea>
    </aside>
  );
}

export function MobileSidebar({ nodes, projectName }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const prefix = `/docs/${projectName}`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <div className="px-7">
          <Link href={`/docs/${projectName}`} className="flex items-center" onClick={() => setOpen(false)}>
            <span className="font-bold uppercase tracking-wider">{projectName}</span>
          </Link>
        </div>
        <ScrollArea className="h-[calc(100vh-8rem)] pl-6 pr-6 pb-6 mt-4">
          <SidebarContent nodes={nodes} pathname={pathname} prefix={prefix} onLinkClick={() => setOpen(false)} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function SidebarContent({ nodes, pathname, prefix, onLinkClick }: { nodes: DocNode[], pathname: string, prefix: string, onLinkClick?: () => void }) {
  return (
    <div className="w-full">
      {nodes.map((node) => (
        <SidebarItem key={node.slug} node={node} pathname={pathname} prefix={prefix} onLinkClick={onLinkClick} />
      ))}
    </div>
  );
}

function SidebarItem({ node, pathname, prefix, onLinkClick }: { node: DocNode, pathname: string, prefix: string, onLinkClick?: () => void }) {
  // Check if isActive based on exact path or if we are a parent of active?
  // Usually highlight exact match.
  // Construct full Href. The node.path should contain the chain of slugs.
  const href = `${prefix}/${node.path}`;
  const isActive = pathname === href;

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="grid grid-flow-row auto-rows-max text-sm relative">
      <Link
        href={href}
        onClick={onLinkClick}
        className={cn(
          "group flex w-full items-center rounded-md border border-transparent px-2 py-1.5 hover:underline text-muted-foreground hover:text-foreground",
          isActive && "font-medium text-primary hover:no-underline"
        )}
      >
        {node.title}
        {isActive && (
          <span className="absolute left-0 top-1.5 h-6 w-[2px] rounded-full bg-primary" />
        )}
      </Link>
      {hasChildren && (
        <div className="pl-4 border-l ml-2 grid grid-flow-row auto-rows-max text-sm gap-1 mt-1 mb-2 border-border/50">
          {node.children.map(child => (
            <SidebarItem key={child.slug} node={child} pathname={pathname} prefix={prefix} onLinkClick={onLinkClick} />
          ))}
        </div>
      )}
    </div>
  )
}
