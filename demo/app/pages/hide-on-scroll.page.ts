import { Component } from '@angular/core';

@Component({
	selector: 'demo-hide-on-scroll',
	template: `
		<ion-header hidenav-header data-testid="library-header">
			<ion-toolbar color="primary">
				<ion-buttons slot="start">
					<ion-back-button defaultHref="/"></ion-back-button>
				</ion-buttons>
				<ion-title>Hide on scroll</ion-title>
			</ion-toolbar>
		</ion-header>

		<ion-content hidenav-content data-testid="library-content">
			<ion-list>
				<ion-item *ngFor="let i of items">
					<ion-label>Item {{ i }}</ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
	`,
})
export class HideOnScrollPage {
	readonly items = Array.from({ length: 80 }, (_, i) => i + 1);
}
