import 'reflect-metadata'
import '../polyfills'

import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpClientModule, HttpClient } from '@angular/common/http'
import { CoreModule } from './core/core.module'
import { SharedModule } from './shared/shared.module'
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io'

import { AppRoutingModule } from './app-routing.module'

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

import { HomeModule } from './home/home.module'

import { AppComponent } from './app.component'
import { HeaderComponent } from './components/header/header.component'
import { WiringComponent } from './components/wiring/wiring.component'
import { EquationsComponent } from './components/equations/equations.component'
import { ParametersComponent } from './components/parameters/parameters.component'
import { VariablesComponent } from './components/variables/variables.component'
import { AngularResizedEventModule } from 'angular-resize-event'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json')
}

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} }

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
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
