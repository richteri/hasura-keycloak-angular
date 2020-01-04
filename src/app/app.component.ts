import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  username = '';
  roles: string[] = [];

  constructor(
    private keycloakService: KeycloakService,
  ) {
  }

  ngOnInit(): void {
    this.keycloakService.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        this.username = this.keycloakService.getUsername();
        this.roles = this.keycloakService.getUserRoles(false);
      }
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this.keycloakService.logout('http://localhost:4200');
  }
}
