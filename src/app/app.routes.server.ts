import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Login can be pre-rendered (no dynamic data)
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  // All authenticated views render on the client — they need live API data
  {
    path: 'dashboard',
    renderMode: RenderMode.Client,
  },
  {
    path: 'inventory',
    renderMode: RenderMode.Client,
  },
  {
    path: 'loans',
    renderMode: RenderMode.Client,
  },
  {
    path: 'neighbors',
    renderMode: RenderMode.Client,
  },
  // Fallback
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
