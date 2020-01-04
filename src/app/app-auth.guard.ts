import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AppAuthGuard extends KeycloakAuthGuard implements CanActivate {
  constructor(protected router: Router, protected keycloakAngular: KeycloakService) {
    super(router, keycloakAngular);
  }

  isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.authenticated) {
        this.keycloakAngular.login({ redirectUri: window.location.href })
          .catch(e => console.error(e));

        return reject(false);
      }

      const requiredRoles: string[] = route.data.roles;

      if (!requiredRoles || requiredRoles.length === 0) {
        return resolve(true);
      }

      if (!this.roles || this.roles.length === 0) {
        resolve(false);
      }
      resolve(requiredRoles.every(role => this.roles.indexOf(role) > -1));
    });
  }
}
