import { HttpClientModule } from '@angular/common/http';
import { ApplicationRef, DoBootstrap, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Apollo, ApolloModule } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { OperationDefinitionNode } from 'graphql';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FactoryComponent } from './factory/factory.component';
import { PlantComponent } from './plant/plant.component';

const keycloakService = new KeycloakService();

@NgModule({
  declarations: [
    AppComponent,
    PlantComponent,
    FactoryComponent,
  ],
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule,
    BrowserModule,
    FormsModule,
    KeycloakAngularModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: KeycloakService,
      useValue: keycloakService,
    },
  ],
  entryComponents: [AppComponent],
})
export class AppModule implements DoBootstrap {

  constructor(
    private apollo: Apollo,
    private httpLink: HttpLink,
  ) {
  }

  ngDoBootstrap(appRef: ApplicationRef): void {
    keycloakService
      .init({
        config: {
          url: environment.keycloak,
          realm: 'poc',
          clientId: 'poc_frontend',
          credentials: {
            secret: 'poc_secret',
          },
        },
        initOptions: {
          // check if user has a valid sso session on page re/load
          onLoad: 'check-sso',
        },
      })
      .then(() => keycloakService.isLoggedIn())
      .then(isLoggedIn => isLoggedIn ? keycloakService.getToken() : Promise.resolve(''))
      .then(wsInitToken => {
        appRef.bootstrap(AppComponent);

        // ws connection started on bootstrap using the most current token
        const ws = new WebSocketLink({
          uri: environment.hasura,
          options: {
            connectionParams: {
              headers: {
                Authorization: `Bearer ${wsInitToken}`,
              },
            },
            reconnect: true,
          },
        });

        // keycloak adds authorization header automatically using the most current token
        const http = this.httpLink.create({
          uri: environment.hasura.replace('ws:', 'http:'),
        });

        const link = split(
          // split based on operation type
          ({ query }) => {
            const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode;

            return kind === 'OperationDefinition' && operation === 'subscription';
          },
          ws,
          http,
        );

        this.apollo.create({
          link,
          cache: new InMemoryCache(),
        });
      });
  }
}
