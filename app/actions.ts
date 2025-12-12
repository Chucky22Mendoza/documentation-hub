'use server'

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { slugify, DocProject, ProjectSummary } from '@/lib/docs';

const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Server-side data fetching functions
export async function getProjects(): Promise<string[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  } catch (error) {
    console.error("Error reading data directory:", error);
    return [];
  }
}

export async function getAllProjectsMetadata(): Promise<ProjectSummary[]> {
  try {
    const slugs = await getProjects();
    const projects = await Promise.all(slugs.map(async (slug) => {
      const data = await getProjectData(slug);
      if (!data) return null;

      return {
        slug,
        title: data.metadata?.title || slug.replace(/[-_]/g, ' '),
        description: data.metadata?.description || `Documentation for ${slug}`,
        type: data.metadata?.type || 'General',
        tags: data.metadata?.tags || []
      };
    }));
    return projects.filter((p): p is ProjectSummary => p !== null);
  } catch (error) {
    console.error("Error getting all projects metadata:", error);
    return [];
  }
}

export async function getProjectData(projectId: string): Promise<DocProject | null> {
  try {
    const filePath = path.join(DATA_DIR, `${projectId}.json`);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading doc file for ${projectId}:`, error);
    return null;
  }
}


export async function saveProject(currentSlug: string | undefined, data: DocProject) {
  try {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }

    // Determine target slug
    let targetSlug = currentSlug;

    // If no current slug (new file) or we want to ensure slug matches title (renaming)
    // For now, let's stick to: if new, generate from title. If existing, keep slug unless we implement generic rename.
    // The prompt implies creating new entries.
    if (!targetSlug) {
      if (!data.metadata?.title) throw new Error("Title is required to generate slug");
      targetSlug = slugify(data.metadata.title);
    }

    const filePath = path.join(DATA_DIR, `${targetSlug}.json`);

    // Write file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    revalidatePath('/');
    if (currentSlug) {
      revalidatePath(`/docs/${currentSlug}`);
    }

    return { success: true, slug: targetSlug };
  } catch (error) {
    console.error("Error saving project:", error);
    return { success: false, error: String(error) };
  }
}

export async function deleteProject(slug: string) {
  try {
    const filePath = path.join(DATA_DIR, `${slug}.json`);
    await fs.unlink(filePath);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error deleting project:", error);
    return { success: false, error: String(error) };
  }
}

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) return { error: "No file uploaded" };

    const buffer = Buffer.from(await file.arrayBuffer());
    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `${Date.now()}-${safeName}`;
    const uploadDir = path.join(PUBLIC_DIR, 'uploads');

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    await fs.writeFile(path.join(uploadDir, fileName), buffer);
    return { url: `/uploads/${fileName}` };
  } catch (error) {
    console.error("Error uploading image:", error);
    return { error: "Upload failed" };
  }
}
