import { getProjectData } from '@/app/actions';
import { DocForm } from '@/components/doc-form';
import { notFound } from 'next/navigation';

interface EditorPageProps {
  params: {
    slug?: string[];
  };
}

export default async function EditorPage({ params }: EditorPageProps) {
  const slug = params.slug?.[0];
  let initialData = undefined;

  if (slug) {
    const data = await getProjectData(slug);
    if (!data) {
      notFound();
    }
    initialData = data;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <DocForm initialData={initialData} slug={slug} />
    </div>
  );
}
