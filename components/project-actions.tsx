'use client'

import { useState } from 'react';
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
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteProject } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function ProjectActions({ slug }: { slug: string }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    await deleteProject(slug);
    setShowDeleteDialog(false);
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={`/editor/${slug}`}>
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" /> Edit Project
          </Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete Project
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta documentación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la documentación de{' '}
              <span className="font-semibold text-foreground">"{slug}"</span> y todos sus datos asociados.
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
    </>
  )
}
