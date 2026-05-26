import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // localStorage is only available in the browser
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (token) {
    return next(req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }));
  }

  return next(req);
};
