import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CharacterCreationPage from './pages/CharacterCreationPage';
import GamePage from './pages/GamePage';
import QuestsPage from './pages/QuestsPage';
import GuildsPage from './pages/GuildsPage';
import CraftingPage from './pages/CraftingPage';
import MarketplacePage from './pages/MarketplacePage';
import StorePage from './pages/StorePage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import { Toaster } from './components/ui/sonner';

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const characterCreationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/character-creation',
  component: CharacterCreationPage,
});

const gameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/game',
  component: GamePage,
});

const questsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/quests',
  component: QuestsPage,
});

const guildsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guilds',
  component: GuildsPage,
});

const craftingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crafting',
  component: CraftingPage,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/marketplace',
  component: MarketplacePage,
});

const storeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store',
  component: StorePage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccessPage,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailurePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  characterCreationRoute,
  gameRoute,
  questsRoute,
  guildsRoute,
  craftingRoute,
  marketplaceRoute,
  storeRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
