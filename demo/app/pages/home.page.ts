import { Component } from '@angular/core';

@Component({
	selector: 'demo-home',
	template: `
		<ion-header>
			<ion-toolbar color="primary">
				<ion-title>ionic-hidenav</ion-title>
			</ion-toolbar>
		</ion-header>

		<ion-content>
			<div class="demo-note">
				Live demo for <strong>&#64;almothafar/ionic-hidenav v8.0.0</strong> &mdash; the final release.
				The first two pages exercise the library itself; the third shows the modern,
				dependency-free replacement recommended in the README.
			</div>

			<ion-list>
				<ion-item button routerLink="/hide-on-scroll" data-testid="link-hide-on-scroll">
					<ion-label>
						<h2>Hide header on scroll</h2>
						<p>Library &mdash; hidenav-header + hidenav-content</p>
					</ion-label>
				</ion-item>
				<ion-item button routerLink="/stretch-header" data-testid="link-stretch-header">
					<ion-label>
						<h2>Stretch header</h2>
						<p>Library &mdash; hidenav-stretchheader + hidenav-sh-content</p>
					</ion-label>
				</ion-item>
				<ion-item button routerLink="/modern" data-testid="link-modern">
					<ion-label>
						<h2>Modern replacement</h2>
						<p>No library &mdash; a ~30 line standalone directive</p>
					</ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
	`,
})
export class HomePage {
}
