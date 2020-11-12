import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserModule } from '@angular/platform-browser';
import { MenuModule } from '@minsky/menu';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AngularResizedEventModule } from 'angular-resize-event';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import 'reflect-metadata';
import '../polyfills';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EquationsComponent } from './components/equations/equations.component';
import { HeaderComponent } from './components/header/header.component';
import { ParametersComponent } from './components/parameters/parameters.component';
import { VariablesComponent } from './components/variables/variables.component';
import { WiringComponent } from './components/wiring/wiring.component';
import { CoreModule } from './core/core.module';
import { HomeModule } from './home/home.module';
import { MaterialModule } from './material.module';
import { SharedModule } from './shared/shared.module';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    WiringComponent,
    EquationsComponent,
    ParametersComponent,
    VariablesComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    MenuModule,
    MaterialModule,
    MatProgressSpinnerModule,
    AppRoutingModule,
    AngularResizedEventModule,
    SocketIoModule.forRoot(config),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
