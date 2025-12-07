import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SkeletonLoaderComponent } from './components/skeleton-loader/skeleton-loader.component';
import { InstallPwaComponent } from './components/install-pwa/install-pwa.component';
import { OfflineIndicatorComponent } from './components/offline-indicator/offline-indicator.component';

@NgModule({
  declarations: [
    SkeletonLoaderComponent,
    InstallPwaComponent,
    OfflineIndicatorComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [
    SkeletonLoaderComponent,
    InstallPwaComponent,
    OfflineIndicatorComponent
  ]
})
export class SharedModule { }
