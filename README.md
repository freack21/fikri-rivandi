# Fikri Rivandi — Portfolio

Personal portfolio website for Fikri Rivandi, live at [refandi.my.id](https://refandi.my.id/).

## Tech Stack

- [React 19](https://react.dev/) with [React Router 7](https://reactrouter.com/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [lucide-react](https://lucide.dev/) icons
- [Oxlint](https://oxc.rs/) for linting

## Getting Started

Requires Node.js (current LTS recommended).

```bash
npm ci          # install dependencies
npm run dev     # start dev server
npm run lint    # lint sources
npm run build   # production build to dist/
npm run preview # preview the production build
```

## Project Structure

```
public/            Static assets (hero image, project images, CV, robots.txt, sitemap.xml)
src/
  data.js          All portfolio content (profile, skills, services, experience, projects)
  App.jsx          Router and light/dark theme handling
  pages/           Home (/) and AllWorks (/works)
  components/      Page sections: Navbar, Hero, About, Services, Experience, Projects, Footer
  index.css        Tailwind setup, theme tokens, base styles
```

To update portfolio content, edit `src/data.js`. Project images live in `public/projects/`.

## Deployment

The site builds to static files in `dist/`. See [deploy.md](deploy.md) for serving it with Nginx on an Ubuntu VPS.
