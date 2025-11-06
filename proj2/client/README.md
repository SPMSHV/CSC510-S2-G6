# CampusBot Client - React + TypeScript + Vite

This is the client application for CampusBot, built with React, TypeScript, and Vite.

For comprehensive frontend documentation, see [docs/FRONTEND.md](../docs/FRONTEND.md).

## Features

### Milestone 2: Student Mobile UI
- **Home Page** - Browse restaurants and search functionality
- **Restaurant Detail** - View menu items and add to cart
- **Checkout** - Place orders with delivery location
- **Order Tracking** - Real-time order status with progress bar
- **My Orders** - View order history and track active orders
- **Authentication** - User registration and login

### Milestone 3: Fleet Dashboard
- **Fleet Dashboard** - Real-time view of all 5 simulated robots
- **Live Telemetry** - Battery, location, speed, and distance metrics
- **Stop Command** - Emergency stop functionality for fleet control
- **Connection Status** - Live indicator for SSE stream connection

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The client will be available at `http://localhost:5173` (or the next available port).

## Available Routes

- `/` - Home page with restaurant browsing
- `/restaurant/:id` - Restaurant detail page with menu
- `/orders` - My Orders page (requires authentication)
- `/orders/:id` - Order tracking page (requires authentication)
- `/fleet` - Fleet Dashboard (Milestone 3)

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
