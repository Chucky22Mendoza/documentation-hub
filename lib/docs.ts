// Type definitions and interfaces
export interface PageNote {
  title?: string;
  content: string;
}

export interface Reference {
  url: string;
  placeholder: string;
}

export interface DocPage {
  title: string;
  purpose: string;
  parent?: string;
  references?: Reference[];
  page_notes: PageNote[];
}

export interface ProjectMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  type?: string;
}

export interface DocProject {
  metadata?: ProjectMetadata;
  pages: DocPage[];
}

export interface ProjectSummary {
  slug: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
}

export const PROJECT_TYPES = [
  'BackEnd',
  'FrontEnd',
  'DevOps',
  'QA',
  'Microservices',
  'Technical specifications'
];

// Pure utility function (no Node.js APIs)
export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

export interface DocNode extends DocPage {
  slug: string;
  children: DocNode[];
  path: string; // Full path including parents
}

export function buildDocTree(pages: DocPage[]): DocNode[] {
  const nodes: Record<string, DocNode> = {};
  const roots: DocNode[] = [];

  // First pass: create nodes
  pages.forEach(page => {
    const slug = slugify(page.title);
    // We use title as ID because parent references title
    nodes[page.title] = {
      ...page,
      slug,
      children: [],
      path: slug // Initial path, will update
    };
  });

  // Second pass: structure tree
  pages.forEach(page => {
    const node = nodes[page.title];
    if (page.parent && nodes[page.parent]) {
      nodes[page.parent].children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Helper to update paths recursively
  const updatePaths = (node: DocNode, parentPath: string) => {
    node.path = parentPath ? `${parentPath}/${node.slug}` : node.slug;
    node.children.forEach(child => updatePaths(child, node.path));
  };

  roots.forEach(root => updatePaths(root, ''));

  return roots;
}

export function findNodeByPath(tree: DocNode[], slugPath: string[]): DocNode | null {
  // Iterate down the path
  if (!slugPath || slugPath.length === 0) return null;

  let currentNodes = tree;
  let result: DocNode | null = null;

  for (const slug of slugPath) {
    const found = currentNodes.find(n => n.slug === slug);
    if (!found) return null;
    result = found;
    currentNodes = found.children;
  }
  return result;
}

export function flattenTree(tree: DocNode[]): DocNode[] {
  let result: DocNode[] = [];
  tree.forEach(node => {
    result.push(node);
    if (node.children) {
      result = result.concat(flattenTree(node.children));
    }
  });
  return result;
}
