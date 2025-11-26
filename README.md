# Welcome to reg-frontend.. v2

## Getting Started

This project is based on Bun, which you can find here:

<https://bun.com/docs/installation>

## Install packages

```bash
bun install
```

## Run development mode

```bash
bun dev
```

## Building For Production

To build this application for production:

(don't forget the RUN part)

```bash
bun run build
```

## Testing

This project uses [Bun](https://bun.com/docs/test/) for testing. You can run the tests with:

```bash
bun test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.

## Routing

This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

## Data Fetching

Always try to use tanstack query for all the fetching.
