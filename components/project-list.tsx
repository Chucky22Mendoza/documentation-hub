"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProjectSummary, PROJECT_TYPES } from '@/lib/docs';
import { deleteProject } from '@/app/actions';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectListProps {
  initialProjects: ProjectSummary[];
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<{ slug: string; title: string } | null>(null);

  const filteredProjects = useMemo(() => {
    return initialProjects.filter(project => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        (project.tags && project.tags.some(tag => tag.toLowerCase().includes(term)));

      const matchesType = selectedType ? project.type === selectedType : true;
      return matchesSearch && matchesType;
    });
  }, [initialProjects, searchTerm, selectedType]);

  const handleDelete = (e: React.MouseEvent, slug: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete({ slug, title });
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete.slug);
      setProjectToDelete(null);
      router.refresh();
    }
  };

  const handleEdit = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/editor/${slug}`);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-6 mb-10 items-end md:items-center justify-between">
        <div className="w-full md:w-1/3 space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-muted-foreground">Search Documentation</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by name or description..."
              className="pl-9 bg-card/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-2/3 flex flex-col items-start md:items-end gap-2">
          <Label className="text-sm font-medium text-muted-foreground">Filter by Type</Label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedType === null ? "default" : "outline"}
              className={cn("cursor-pointer px-3 py-1.5 transition-all text-sm", selectedType === null ? "hover:bg-primary/90" : "hover:bg-muted")}
              onClick={() => setSelectedType(null)}
            >
              All
            </Badge>
            {PROJECT_TYPES.map(type => (
              <Badge
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                className={cn("cursor-pointer px-3 py-1.5 transition-all text-sm", selectedType === type ? "hover:bg-primary/90" : "hover:bg-muted")}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="p-16 text-center border rounded-xl bg-muted/10 border-dashed animate-in fade-in-50">
          <p className="text-muted-foreground text-lg">No projects found that match your filters.</p>
          <div className="mt-4">
            <button
              onClick={() => { setSearchTerm(''); setSelectedType(null); }}
              className="text-primary hover:underline text-sm font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
          {filteredProjects.map((project) => (
            <Link key={project.slug} href={`/docs/${project.slug}`} className="group block h-full">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 bg-card/50 backdrop-blur-sm flex flex-col relative overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs font-normal bg-primary/10 text-primary border-primary/20">
                      {project.type}
                    </Badge>
                  </div>
                  <CardTitle className="capitalize text-xl group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 min-h-[4.5em]">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {project.tags.slice(0, 3).map(tag => (
                        <div key={tag} className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {tag}
                        </div>
                      ))}
                      {project.tags.length > 3 && (
                        <div className="text-[10px] text-muted-foreground px-1 py-0.5">
                          +{project.tags.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="p-4 flex items-center justify-between gap-4 border-t bg-muted/20 mt-auto">
                  <div className="text-xs font-medium text-primary flex items-center gap-1 py-2">
                    <Eye className="w-3 h-3" /> View
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-background" onClick={(e) => handleEdit(e, project.slug)}>
                      <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-background hover:text-destructive" onClick={(e) => handleDelete(e, project.slug, project.title)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta documentación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la documentación de{' '}
              <span className="font-semibold text-foreground">"{projectToDelete?.title}"</span> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
