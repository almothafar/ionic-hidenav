import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HidenavModule } from '@almothafar/ionic-hidenav';

import { AppComponent } from './app.component';
import { HideHeaderOnScrollDirective } from './hide-header-on-scroll.directive';
import { HideOnScrollPage } from './pages/hide-on-scroll.page';
import { HomePage } from './pages/home.page';
import { ModernPage } from './pages/modern.page';
import { StretchHeaderPage } from './pages/stretch-header.page';

const routes: Routes = [
	{ path: '', component: HomePage },
	{ path: 'hide-on-scroll', component: HideOnScrollPage },
	{ path: 'stretch-header', component: StretchHeaderPage },
	{ path: 'modern', component: ModernPage },
	{ path: '**', redirectTo: '' },
];

@NgModule({
	declarations: [
		AppComponent,
		HomePage,
		HideOnScrollPage,
		StretchHeaderPage,
		ModernPage,
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		// Hash routing keeps deep links working on GitHub Pages without a 404 shim.
		RouterModule.forRoot(routes, { useHash: true }),
		HidenavModule,
		HideHeaderOnScrollDirective,
	],
	bootstrap: [AppComponent],
})
export class AppModule {
}
