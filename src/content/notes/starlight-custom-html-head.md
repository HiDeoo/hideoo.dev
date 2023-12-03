---
title: Edit the HTML head of Starlight pages
description: Learn how to customize the HTML head of Starlight pages to add custom meta tags, styles, or scripts.
publishDate: 2023-12-03
---

The [HTML head](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/head) is the contents of the `<head>` element of an HTML document.
This part of the document is not visible to the user but is used by web browsers and search engines to know how to display the page, load external resources like CSS or scripts, or to know various information about the page.

## Configure the HTML head in Starlight

[Starlight](https://starlight.astro.build) has built-in support for customizing the HTML head of pages using a [`HeadConfig`](https://starlight.astro.build/reference/configuration/#headconfig) object representing each element to add to the HTML head.

```ts
interface HeadConfig {
  // The name of the tag, e.g. "meta", "link", "script", etc.
  tag: string
  // The attributes of the tag, e.g. { name: "author", content: "HiDeoo" }.
  attrs?: Record<string, string | boolean | undefined>
  // The content of the tag located between the opening and closing tags,
  // e.g. <title>My page</title>.
  content?: string
}
```

To add a custom element to the HTML head of every page, use the [global `head`](https://starlight.astro.build/reference/configuration/#head) configuration option in your `astro.config.mjs` file:

```js ins={9-18}
// astro.config.mjs
import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      head: [
        // Add a custom meta tag to define the author of all pages.
        {
          tag: 'meta',
          attrs: {
            name: 'author',
            content: 'HiDeoo',
          },
        },
      ],
    }),
  ],
})
```

Pages can also define custom elements to add to the HTML head for that specific page using the [`head`](https://starlight.astro.build/reference/frontmatter/#head) frontmatter field:

```diff lang="md"
---
// src/content/docs/example.md
title: My content page
+head:
+  # Add a custom meta tag to define the author of this page.
+  - tag: meta
+    attrs:
+      name: author
+      content: HiDeoo
---

The content of my page.
```

Using one of these two methods, the following HTML head is generated for the page(s):

```html
<head>
  <!-- ... -->
  <meta name="author" content="HiDeoo" />
</head>
```

To quickly convert head elements from HTML to the `HeadConfig` format that Starlight uses (either in JavaScript or YAML), you can use the [Starlight `<head>` Generator](https://starlight-head-generator.vercel.app/) which is a small web application that I made to help with this task.

## Custom HTML head examples

The following examples illustrate various use cases for customizing the HTML head of Starlight pages.

### Open Graph images

[Open Graph Data](https://ogp.me/) can be used by social media platforms like Facebook, X (formerly called Twitter), or Discord to add an image to your Starlight page links when sharing them.
The image URL can be defined using the `og:image` and `twitter:image` meta tags:

```js {5-23}
export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      // Add Open Graph images.
      head: [
        {
          tag: 'meta',
          attrs: {
            property: 'og:image',
            // The absolute URL of the image to use.
            content: 'https://example.com/og.png',
          },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'twitter:image',
            // The absolute URL of the image to use.
            content: 'https://example.com/og.png',
          },
        },
      ],
    }),
  ],
})
```

### Web analytics

To start using most web analytics tools like [Plausible](https://plausible.io/), [Fathom](https://usefathom.com/), or [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/), you usually need to add a script to the HTML head of your pages:

```js {5-16}
export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      // Add a script to use web analytics.
      head: [
        {
          tag: 'script',
          attrs: {
            // Tweaks to the script URL or attributes can be made here.
            src: 'https://analytics.example.com/script.js',
            'data-id': 'MY_ANALYTICS_ID',
            defer: true,
          },
        },
      ],
    }),
  ],
})
```

### Google Tag Manager

Setting up [Google Tag Manager](https://marketingplatform.google.com/about/tag-manager/) in Starlight involves a slightly different approach than the previous examples as it requires adding a `<script>` tag to the HTML head but also a `<noscript>` tag to the HTML body.

Starlight [component overrides](https://starlight.astro.build/guides/overriding-components/) can be used to add the `<noscript>` immediately after the `<body>` tag as recommended by Google.
The [`<SkipLink/>`](https://starlight.astro.build/reference/overrides/#skiplink) component is a good candidate for this as it is already rendered at the top of the HTML body.

Create a custom Astro component to replace the existing `<SkipLink/>` built-in component:

```astro
---
// src/components/SkipLink.astro
import type { Props } from '@astrojs/starlight/props'
import Default from '@astrojs/starlight/components/SkipLink.astro'
---

<!-- Add the noscript tag for Google Tag Manager. -->
<noscript>
  <iframe
    src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"
    height="0"
    width="0"
    style="display:none;visibility:hidden"
  >
  </iframe>
</noscript>

<!-- Render the default <SkipLink/> component. -->
<Default {...Astro.props}><slot /></Default>
```

Configure Starlight to use this new component instead of the built-in one by specifying its path in the [`components`](https://starlight.astro.build/reference/configuration/#components) configuration option and also add the `<script>` tag to the HTML head:

```js {5-18}
export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      // Add a script for Google Tag Manager.
      head: [
        {
          tag: 'script',
          // Content truncated for brevity.
          content:
            "(function(w,d,s,l,i){ ... })(window,document,'script','dataLayer','GTM-XXXX');",
        },
      ],
      // Replace the built-in <SkipLink/> component.
      components: {
        // Relative path to the custom component.
        SkipLink: './src/components/SkipLink.astro',
      },
    }),
  ],
})
```

### Google Fonts

Some libraries simplify using [Google Fonts](https://fonts.google.com/) like [Fontsource](https://fontsource.org/) which provides various other benefits like self-hosting performance improvements, versioning, privacy, and more.
The Starlight documentation contains a [guide](https://starlight.astro.build/guides/customization/#set-up-a-fontsource-font) on how to use Fontsource with Starlight, but if you want to use Google Fonts directly, you can use the following configuration to load the font:

```js {5-26}
export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      // Load a font from Google Fonts.
      head: [
        {
          tag: 'link',
          attrs: {
            href: 'https://fonts.googleapis.com',
            rel: 'preconnect',
          },
          tag: 'link',
          attrs: {
            href: 'https://fonts.gstatic.com',
            rel: 'preconnect',
            crossorigin: true,
          },
          tag: 'link',
          attrs: {
            // Tweaks to the font URL can be made here.
            href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap',
            rel: 'stylesheet',
          },
        },
      ],
    }),
  ],
})
```

### Load a JavaScript file

To load a JavaScript file that should not be processed by Astro, you can place it in the `public/` directory and use the following configuration to load it:

```js {5-14}
export default defineConfig({
  integrations: [
    starlight({
      title: 'My Docs',
      // Load a JavaScript file.
      head: [
        {
          tag: 'script',
          attrs: {
            src: '/my-script.js',
            defer: true,
          },
        },
      ],
    }),
  ],
})
```
