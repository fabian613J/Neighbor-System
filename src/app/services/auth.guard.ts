import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.services';

export const authGuard: CanActivateFn = () => {
  // During SSR, localStorage is unavailable — treat as unauthenticated
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return inject(Router).createUrlTree(['/login']);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  return router.createUrlTree(['/login']);
};
