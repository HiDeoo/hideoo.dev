---
title: Paste images to Starlight pages with Visual Studio Code
description: Improve your Starlight documentation workflow by pasting images to your documentation pages using Visual Studio Code.
publishDate: 2023-12-07
---

Local images using the standard Markdown `![alt](src)` syntax in a [Starlight](https://starlight.astro.build) documentation page (`.md` or `.mdx` file) are automatically optimized using the Astro [Image Service API](https://docs.astro.build/en/reference/image-service-reference/).
It is [recommended](https://docs.astro.build/en/guides/images/#src-vs-public) to store these images in the `src/` directory, e.g. `src/assets/` as files in the `public/` directory are copied as-is into the build folder, without any processing.

If you are using [Visual Studio Code](https://code.visualstudio.com/) to edit your documentation files, it is possible to configure it so that images pasted in a Markdown editor are automatically copied to the `src/assets/` directory.

## Prerequisites

You will need to have an existing Starlight website and Visual Studio Code installed.

## Configure Visual Studio Code

Considering this configuration is specific to Starlight and that the paths may vary depending on your project structure, it is recommended to configure Visual Studio Code for a specific project only, using [workspace settings](https://code.visualstudio.com/docs/getstarted/settings#_workspace-settings).
These settings are stored at the root of your project in a `.vscode/` directory and can be shared with other developers working on the same project.

Create or edit the `.vscode/settings.json` file to add the following configuration:

```diff lang="json"
// .vscode/settings.json
{
+  // Enable pasting files into a Markdown editor to create Markdown links.
+  "markdown.editor.filePaste.enabled": true,
+  // Copy pasted media files into a Markdown editor to the workspace.
+  "markdown.editor.filePaste.copyIntoWorkspace": "mediaFiles",
+  // Copy pasted files in documentation pages to the `src/assets/` directory.
+  "markdown.copyFiles.destination": {
+    "/src/content/docs/**/*": "/src/assets/"
+  }
}
```

With the above configuration, when pasting an image named `demo.png` in the `src/content/docs/example.md` file, it will automatically be copied to the `src/assets/demo.png` file and the Markdown syntax will be updated to use the new path.

```mdx {6}
---
// src/content/docs/example.md
title: My content page
---

![Alt text](../../../assets/demo.png)
```

:::note
By default, if a pasted file already exists, it will be renamed by appending a number to the file name. You can change this behavior using the [`markdown.copyFiles.overwriteBehavior`](https://code.visualstudio.com/updates/v1_79#_markdowncopyfilesoverwritebehavior) configuration option.
:::

## Group images per page

For a better organization of your images, you can group them per page in a subdirectory of the `src/assets/` directory.
For example, all images used in the `src/content/docs/example.md` file can be stored in the `src/assets/docs/example/` directory.

To do so, update the `markdown.copyFiles.destination` configuration to use the `${documentBaseName}` variable in the destination path:

```json ins="${documentBaseName}/"
{
  "markdown.copyFiles.destination": {
    "/src/content/docs/**/*": "/src/assets/${documentBaseName}/"
  }
}
```

With the above configuration, when pasting an image named `demo.png` in the `src/content/docs/example.md` file, it will automatically be copied to the `src/assets/example/demo.png` file.

## Enable file dropping

You can also enable file dropping in the Markdown editor while holding the `Shift` key as an alternative to pasting images:

```diff lang="json"
{
  "markdown.editor.filePaste.enabled": true,
  "markdown.editor.filePaste.copyIntoWorkspace": "mediaFiles",
+  // Enable dropping files into a Markdown editor to create Markdown links.
+  "markdown.editor.drop.enabled": true,
+  // Copy dropped media files into a Markdown editor to the workspace.
+  "markdown.editor.drop.copyIntoWorkspace": "mediaFiles",
  "markdown.copyFiles.destination": {
    "/src/content/docs/**/*": "/src/assets/"
  },
}
```
