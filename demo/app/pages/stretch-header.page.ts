import { Component, ViewChild } from '@angular/core';
import { HidenavStretchheaderComponent } from '@almothafar/ionic-hidenav';

@Component({
	selector: 'demo-stretch-header',
	template: `
		<hidenav-stretchheader #sh header-height="56" opacity-factor="6" data-testid="stretch-header">
			<div #shrinkexpand class="demo-hero">Pull down to stretch</div>
			<div #static class="demo-static-title">
				<ion-back-button defaultHref="/" color="light" data-testid="stretch-back"></ion-back-button>
				<span>Stretch header</span>
			</div>
		</hidenav-stretchheader>

		<ion-content hidenav-sh-content data-testid="stretch-content">
			<div class="demo-note">
				The header starts collapsed at its <code>header-height</code> and stretches when you
				drag the list downwards. The buttons drive the component's public API.
			</div>

			<ion-buttons class="ion-padding">
				<ion-button fill="outline" data-testid="btn-expand" (click)="sh.expand()">Expand</ion-button>
				<ion-button fill="outline" data-testid="btn-shrink" (click)="sh.shrink()">Shrink</ion-button>
				<ion-button fill="outline" data-testid="btn-toggle" (click)="sh.toggle()">Toggle</ion-button>
			</ion-buttons>

			<ion-list>
				<ion-item *ngFor="let i of items">
					<ion-label>Item {{ i }}</ion-label>
				</ion-item>
			</ion-list>
		</ion-content>
	`,
})
export class StretchHeaderPage {
	@ViewChild('sh') stretchHeader!: HidenavStretchheaderComponent;

	readonly items = Array.from({ length: 80 }, (_, i) => i + 1);
}
