import { AfterViewInit, ContentChild, Directive, ElementRef, Host, OnDestroy, Optional, Self } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { SuperTabs } from '@ionic-super-tabs/angular';
import { HidenavShService } from './hidenav-sh-service.service';
import { closestAncestorContaining, setAttributeOnMatches } from './hidenav-dom';

@Directive({
	selector: '[hidenav-sh-tabscontent]'
})
export class HidenavShTabscontentDirective implements AfterViewInit, OnDestroy {

	name: any;
	@ContentChild(SuperTabs) supertabs: SuperTabs;

	constructor(public contentElem: ElementRef, @Host() @Self() @Optional() public el: IonContent, private globals: HidenavShService) {
	}

	ngAfterViewInit() {
		this.name = this.globals.requestName();
		this.contentElem.nativeElement.setAttribute('hidenav-sh-tabscontent', this.name);
		setAttributeOnMatches(
			closestAncestorContaining(this.contentElem.nativeElement, '[hidenav-stretchheader]'),
			'hidenav-stretchheader', 'hidenav-sh-header', this.name);
		if (this.name) {
			if (!this.globals.data[this.name]) {
				this.globals.data[this.name] = [];
			}
			this.globals.data[this.name].tabscontent = this.el;
			this.globals.data[this.name].tabscontentElem = this.contentElem;
			this.globals.data[this.name].supertabs = this.supertabs;
			this.globals.initiate(this.name);

			this.supertabs.tabChange.subscribe(e => {
				const i = e.detail.index;
				const tabs = this.contentElem.nativeElement.querySelectorAll('super-tab');
				const results = [];
				for (const tab of tabs) {
					const cont = tab.querySelector('ion-content');
					if (cont != null && !!cont.attributes['hidenav-sh-content'] && cont.attributes['hidenav-sh-content'].nodeValue !== '') {
						results.push(cont.attributes['hidenav-sh-content'].nodeValue);
					}
					else {
						results.push(null);
					}
				}
				if (results[i] != null) {
					this.globals.resetContent(results[i]);
				}
			});
		}
	}

	ngOnDestroy() {
		delete this.globals.data[this.name].tabscontent;
	}

}
