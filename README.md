# Fikri Rivandi — Portfolio

Personal portfolio website for Fikri Rivandi, live at [refandi.my.id](https://refandi.my.id/).

## Tech Stack

- [React 19](https://react.dev/) with [React Router 7](https://reactrouter.com/)
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [lucide-react](https://lucide.dev/) icons
- [three.js](https://threejs.org/) for the 3D workspace illustration
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
  components/      Page sections (Navbar, Hero, About, ...), WalkingCat, WorkspaceScene
  three/           three.js workspace illustration, lazy-loaded by WorkspaceScene
  index.css        Tailwind setup, theme tokens, base styles
```

To update portfolio content, edit `src/data.js`. Project images live in `public/projects/`.

## Deployment

Production runs on the DIGISION Coolify instance, built from the `neo-brutalism` branch with `Dockerfile` and `docker-compose.yml` (nginx serving `dist/` on port 8080). CI deploys every green push to `neo-brutalism`. First-time setup on the server:

```bash
curl -fsSL https://raw.githubusercontent.com/freack21/fikri-rivandi/neo-brutalism/deploy/coolify/setup.sh -o setup.sh
sudo bash setup.sh check
sudo bash setup.sh deploy --domain refandi.my.id
```

See [docs/deploy-coolify.md](docs/deploy-coolify.md) for DNS, tokens, CI secrets and troubleshooting. [deploy.md](deploy.md) describes the older manual Nginx setup on a VPS.

`npm test` runs the Coolify provisioner tests.
