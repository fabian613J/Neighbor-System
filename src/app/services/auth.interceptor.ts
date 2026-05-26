import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Obtenemos el token del localStorage
  const token = localStorage.getItem('token');

  // 2. Si el token existe, clonamos la petición y le añadimos el Header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Interceptor: Token inyectado en la petición');
    return next(cloned);
  }

  // 3. Si no hay token (ej. en el login o registro), la petición sigue normal
  return next(req);
};