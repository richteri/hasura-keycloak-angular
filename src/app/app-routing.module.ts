import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthGuard } from './app-auth.guard';
import { FactoryComponent } from './factory/factory.component';
import { PlantComponent } from './plant/plant.component';

const routes: Routes = [
  {
    // forces auth
    path: 'plant',
    component: PlantComponent,
    canActivate: [AppAuthGuard],
  },
  {
    // available without auth
    path: 'factory',
    component: FactoryComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AppRoutingModule {
}
