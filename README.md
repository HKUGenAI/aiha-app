# AIHA (AI Historian Assistant)

<img width="800" alt="Screenshot 2025-03-10 at 10 39 27 PM" src="https://github.com/user-attachments/assets/efd7b586-0763-4c56-9a8c-797a079cb33f" />

## Prerequisites

- Node.js 18+ 
- [pnpm](https://pnpm.io/) (v9.12.3 or newer)
- MongoDB instance

## Getting Started

1. Clone the repository
```bash
git clone <repository-url>
cd aiha-app
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

**For Maintainers** Contact Team for credentials(env variables)

Fill in the following variables in `.env`:
- `AUTH_SECRET` - Generate using `npx auth secret`
- `AUTH_GITHUB_ID` - Your GitHub Client ID
- `AUTH_GITHUB_SECRET` - Your GitHub Client Secret
- `MONGODB_URI` - Your MongoDB connection string
- `AZURE_STORAGE_CONNECTION_STRING` - Your Azure Blob Storage Connection String
- `IMAGES_BASE_URL` - Your Image Directory Azure Blob Storage URL
- `AZURE_RESOURCE_NAME` - Your Azure OpenAI Resource Name
- `AZURE_API_KEY` - Your Azure OpenAI API Key
- Other auth provider credentials as needed

4. Set up Atlas Vector Search Index
```bash
node create-vector-index.js
```

5. Run the development server
```bash
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Development Workflow

### Maintainer Notes
- Use pnpm for package management
- Use `pnpm format:check` and `pnpm format:write` to check and apply formatting before committing

### Database Schema

MongoDB schemas are defined in `src/server/models/`. Example schema:
- `Project` (`src/server/models/project.ts`)

### Authentication

- Uses NextAuth.js with JWT strategy
- Currently supports HKU email domains (`@connect.hku.hk`, `@hku.hk`, `@cs.hku.hk`)
- Configuration in `src/server/auth/`

### Project Structure

```
├── src/
│   ├── app/          # Next.js 13+ App Router
│   ├── server/       # Server-side code
│   │   ├── actions/  # Server actions
│   │   ├── auth/     # Auth configuration
│   │   ├── models/   # MongoDB schemas
│   ├── styles/       # Global styles
├── public/           # Static assets
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm preview` - Preview production build locally

## Tech Stack

This project uses the [T3 Stack](https://create.t3.gg/), which includes:

- **[Next.js](https://nextjs.org)** - React framework for production
- **[NextAuth.js](https://next-auth.js.org)** - Authentication system
- **[MongoDB](https://www.mongodb.com/)** - Database (with Mongoose ODM)
- **[Mongoose](https://mongoosejs.com/)** - MongoDB ODM
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

## Learn More

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
