import { Component } from '@angular/core';

@Component({
	selector: 'demo-modern',
	template: `
		<ion-header data-testid="modern-header">
			<ion-toolbar color="secondary">
				<ion-buttons slot="start">
					<ion-back-button defaultHref="/"></ion-back-button>
				</ion-buttons>
				<ion-title>Modern replacement</ion-title>
			</ion-toolbar>
		</ion-header>

		<ion-content hideHeaderOnScroll data-testid="modern-content">
			<div class="demo-note">
				No library here &mdash; just the standalone directive from the README.
			</div>
			<ion-list>
				<ion-item *ngFor="let i of items">
					<ion-label>Item {{ i }}</ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
	`,
})
export class ModernPage {
	readonly items = Array.from({ length: 80 }, (_, i) => i + 1);
}
