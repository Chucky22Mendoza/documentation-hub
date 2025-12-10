# Documentation Hub

A modern, centralized documentation hub designed for software development teams. This project allows for the visualization of detailed technical documentation, user guides, and architecture specifications in a unified and attractive interface.

## 🚀 Purpose

The main objective of this project is to consolidate documentation from multiple microservices, platforms, and tools in a single place. It prevents knowledge fragmentation by allowing each project to have its own structured definition file, which the Hub automatically renders with consistent navigation, search, and styling.

## 🛠️ How it Works

The system is built on **Next.js 14** and works by dynamically reading JSON files located in the `data/` folder. It is not necessary to rebuild the project to add new documentation; simply by adding a valid JSON file, the Hub will index and display it immediately.

### Key Features:
- **Automatic Indexing**: Automatically reads all `.json` files in the data directory.
- **Hierarchical Navigation**: Generates nested side menus based on parent-child relationships defined in the data.
- **Search and Filtering**: Allows finding projects by name, description, tags, or type (Frontend, Backend, DevOps, etc.).
- **Responsive Design**: Interface adapted for desktop and mobile devices.
- **HTML Rendering**: Supports rich HTML content within page notes.

## 📝 Adding New Documentation

To add a new project to the Hub:

1.  Navigate to the `data/` folder in the project root.
2.  Create a new JSON file using kebab-case naming (lowercase and hyphens).
    *   Example: `logistics-platform.json` or `payment-gateway-v2.json`.
3.  The filename (without the extension) will become the URL "slug" (e.g., `/docs/logistics-platform`).

### JSON Structure

The JSON file must strictly follow this structure to function correctly:

```json
{
  "metadata": {
    "title": "Project Name",
    "description": "A short description that will appear on the homepage card.",
    "type": "BackEnd",
    "tags": ["NodeJS", "Microservices", "API"]
  },
  "pages": [
    {
      "title": "Introduction",
      "purpose": "General purpose of this section",
      "page_notes": [
        {
          "title": "Welcome",
          "content": "<p>HTML content here.</p>"
        }
      ]
    },
    {
      "title": "Architecture",
      "purpose": "Technical details",
      "parent": "Introduction",
      "references": ["src/app.ts", "docker-compose.yml"],
      "page_notes": [
        {
          "title": "Flow Diagram",
          "content": "<p>Details...</p>"
        }
      ]
    }
  ]
}
```

### Important Field Details

#### Metadata
*   **`type`**: Defines the category for filters. Recommended values: `"BackEnd"`, `"FrontEnd"`, `"DevOps"`, `"QA"`, `"Microservices"`, `"Technical specifications"`.
*   **`tags`**: Array of strings to assist in search (e.g., technologies used).

#### Pages (Menu Structure)
The magic of the side menu lies in the **`parent`** property.

1.  **Top Level**: If a page does not have the `parent` property, it will appear at the first level of the side menu.
2.  **Sub-pages**: To nest a page inside another (create a submenu), you must add the `parent` property with the **EXACT** value of the parent page's `title`.

**Hierarchy Example:**

*   **Page 1**: `title: "Home"` (No parent)
    *   **Page 2**: `title: "Installation"`, `parent: "Home"` (Appears inside Home)

> ⚠️ **Note**: Ensure that titles are unique within the same project to avoid conflicts in navigation tree generation.

#### Content (page_notes)
Each page can have multiple notes.
*   **`title`**: Optional. If added, it will appear in the "On This Page" menu on the right for quick in-page navigation.
*   **`content`**: Accepts text strings with HTML format. You can use tags like `h2`, `p`, `ul`, `li`, `pre`, `code` to format your documentation richly.

#### References
An optional array of strings. It is used to list key files or important routes related to that section. They are rendered at the bottom of the page with a "code snippet" style.

## 💻 Local Execution

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000).
