// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cloud Architect Library',
  tagline: 'Documentación Técnica y Buenas Prácticas',
  favicon: 'img/favicon.png',

  future: {
    v4: true,
  },

  // CONFIGURACIÓN CRÍTICA PARA GITHUB PAGES
  url: 'https://Cloud-Architect-Library.github.io',
  baseUrl: '/guides/', // El nombre de tu repositorio con barras
  organizationName: 'Cloud-Architect-Library',
  projectName: 'guides',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Ajustado a tu repo
          editUrl:
            'https://github.com/Cloud-Architect-Library/guides/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Cloud Architect Library',
        logo: {
          alt: 'Cloud Architect Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Guías',
          },

          {
            href: 'https://github.com/Cloud-Architect-Library/guides',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Contenido',
            items: [
              {
                label: 'Introducción',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Recursos',
            items: [
              {
                label: 'AWS Architecture Center',
                href: 'https://aws.amazon.com/architecture/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cloud Architect Library. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;