import { AfterViewInit, ContentChild, Directive, ElementRef, forwardRef, Host, OnDestroy, Optional, Self } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { HidenavService } from './hidenav-service.service';
import { SuperTabs } from '@ionic-super-tabs/angular';
import { closestAncestorContaining, setAttributeOnMatches } from './hidenav-dom';

@Directive({
	selector: '[hidenav-tabscontent]'
})
export class HidenavTabscontentDirective implements AfterViewInit, OnDestroy {

	@ContentChild(forwardRef(() => SuperTabs)) supertabs: SuperTabs;

	name: any;

	constructor(@Host() @Self() @Optional() public el: IonContent, public contentElem: ElementRef, private globals: HidenavService) {

	}

	ngAfterViewInit() {
		this.name = this.globals.requestName();
		this.contentElem.nativeElement.setAttribute('hidenav-tabscontent', this.name);
		setAttributeOnMatches(
			closestAncestorContaining(this.contentElem.nativeElement, '[hidenav-header]'),
			'[hidenav-header]', 'hidenav-header', this.name);
		if (this.name) {
			if (!this.globals.data[this.name]) {
				this.globals.data[this.name] = [];
			}
			this.globals.data[this.name].tabscontent = this.el;
			this.globals.data[this.name].tabscontentElem = this.contentElem;
			this.globals.initiate(this.name);

			if (this.supertabs) {
				this.supertabs.tabChange.subscribe(e => {
					if (e.detail.changed) {
						const i = e.detail.index;
						const tabs = this.contentElem.nativeElement.querySelectorAll('super-tab');
						const results = [];
						for (const tab of tabs) {
							const cont = tab.querySelector('ion-content');
							if (cont.attributes['hidenav-content']) {
								results.push(cont.attributes['hidenav-content'].nodeValue);
							}
							else {
								results.push(null);
							}
						}
						if (results[i] != null) {
							this.globals.resetTabs(this.name, results[i]);

						}
					}
				});
			}
		}
	}

	ngOnDestroy() {
		if (this.name) {
			delete this.globals.data[this.name].tabscontent;
		}
	}

}
