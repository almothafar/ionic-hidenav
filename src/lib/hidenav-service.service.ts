import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class HidenavService {

	data = [];
	names = [];
	tabnames = [];

	constructor() {
	}

	requestName() {
		const name = 'page' + this.names.length;
		this.names.push(name);
		return name;
	}

	requestTabName(name) {
		if (!this.tabnames[name]) {
			this.tabnames[name] = [];
		}
		const tabname = name + 'tab' + this.tabnames[name].length;
		this.tabnames[name].push(tabname);
		return tabname;
	}

	initiate(name) {
		const names = [];
		for (const key in this.data) {
			if (this.data[key].parent === name) {
				names.push(key);
			}
		}
		for (const n of names) {
			this.initiate2(n);
		}
		if (names.length === 0) {
			this.initiate2(name);
		}
	}

	initiate2(name) {
		if (!(this.data[name]
			&& (this.data[name].parent && this.data[this.data[name].parent].tabscontent && this.data[name].content && this.data[this.data[name].parent].header)
			|| (!this.data[name].parent && this.data[name].content && this.data[name].header)
		)) {
			return false;
		}
		const parent = this.data[name].parent;
		const content = this.data[name].content;
		const contentElem = this.data[name].contentElem;
		if (this.data[name].scrollTop == null) {
			this.data[name].scrollTop = 0;
		}
		if (this.data[name].lastscroll == null) {
			this.data[name].lastscroll = 0;
		}
		if (this.data[name].direction == null) {
			this.data[name].direction = '';
		}
		if (this.data[name].tapping == null) {
			this.data[name].tapping = false;
		}
		content.scrollEvents = true;
		if (!parent) {
			const header = this.data[name].header;
			setTimeout(() => {
				this.data[name].navheight = this.data[name].header.nativeElement.offsetHeight;
				const scrollContent: any = contentElem.nativeElement.shadowRoot.querySelector('.inner-scroll');
				this.data[name].paddingTop = parseInt(window.getComputedStyle(scrollContent)['padding-top'], 10);
				content.ionScroll.subscribe((e) => {
					if (e.detail.scrollTop === 0) {
						scrollContent.style.top = null;
						scrollContent.style.paddingTop = this.data[name].paddingTop + 'px';
					} else {
						scrollContent.style.top = '-' + this.data[name].navheight + 'px';
						scrollContent.style.paddingTop = this.data[name].paddingTop + this.data[name].navheight + 'px';
					}
					if (scrollContent.scrollHeight > (scrollContent.clientHeight + 100)) {
						this.data[name].scrolling = true;
						const x = this.data[name].lastscroll - e.detail.scrollTop;
						this.data[name].direction = x > 0 ? 'up' : 'down';
						this.data[name].lastscroll = e.detail.scrollTop;
						this.data[name].scrollTop = this.data[name].scrollTop - x;
						if (this.data[name].scrollTop > this.data[name].navheight) {
							this.data[name].scrollTop = this.data[name].navheight;
						}
						if (this.data[name].scrollTop < 0) {
							this.data[name].scrollTop = 0;
						}
						header.nativeElement.style.transform = 'translate3d(0, ' + -this.data[name].scrollTop + 'px, 0)';
					}
				});
				content.ionScrollEnd.subscribe(() => {
					setTimeout(() => {
						// catch the last tick
						if (scrollContent.scrollTop === 0) {
							scrollContent.style.top = null;
							scrollContent.style.paddingTop = this.data[name].paddingTop + 'px';
						}
						this.data[name].scrolling = false;
						this.c(name);
					}, 10);
				});
			}, 100);
			contentElem.nativeElement.addEventListener('touchend', () => {
				this.data[name].tapping = false;
				this.c(name);
			});
			contentElem.nativeElement.addEventListener('touchstart', () => this.data[name].tapping = true);
		} else if (parent) {
			const header = this.data[parent].header;
			const tabscontentElem = this.data[parent].tabscontentElem;
			const supertabsToolbar: any = tabscontentElem.nativeElement.querySelector('super-tabs-toolbar');
			setTimeout(() => {
				this.data[parent].tabscontentHeight = tabscontentElem.nativeElement.scrollHeight;
				const scrollContent: any = contentElem.nativeElement.shadowRoot.querySelector('.inner-scroll');
				const tabsscrollContent: any = this.data[parent].tabscontentElem.nativeElement.shadowRoot.querySelector('.inner-scroll');
				if (scrollContent.scrollHeight > (scrollContent.clientHeight + 100)) {
					this.data[name].navheight = this.data[parent].header.nativeElement.offsetHeight;
					this.data[name].paddingTop = parseInt(window.getComputedStyle(scrollContent)['padding-top'], 10);
				}
				content.ionScroll.subscribe((e) => {
					if (this.data[name].tapping && scrollContent.scrollHeight > (scrollContent.clientHeight + 100)) {
						if (e.detail.scrollTop === 0) {
							supertabsToolbar.style.position = 'static';
							scrollContent.style.paddingTop = this.data[name].paddingTop + 'px';
							tabscontentElem.nativeElement.style.top = null;
							tabsscrollContent.style.height = this.data[parent].tabscontentHeight + 'px';
							tabscontentElem.nativeElement.style.top = null;
						} else {
							const s = e.detail.scrollTop;
							supertabsToolbar.style.position = 'absolute';
							supertabsToolbar.style.top = this.data[name].navheight + 'px';
							tabsscrollContent.style.height = (this.data[parent].tabscontentHeight + this.data[name].navheight) + 'px';
							tabscontentElem.nativeElement.style.top = '-' + this.data[name].navheight + 'px';
							scrollContent.style.paddingTop = this.data[name].paddingTop + supertabsToolbar.clientHeight + this.data[name].navheight + 'px';
							scrollContent.scrollTop = s;
						}
					}
					this.data[name].scrolling = true;
					const x = this.data[name].lastscroll - e.detail.scrollTop;
					this.data[name].direction = x > 0 ? 'up' : 'down';
					this.data[name].lastscroll = e.detail.scrollTop;
					this.data[name].scrollTop = this.data[name].scrollTop - x;
					if (this.data[name].scrollTop > this.data[name].navheight) {
						this.data[name].scrollTop = this.data[name].navheight;
					}
					if (this.data[name].scrollTop < 0) {
						this.data[name].scrollTop = 0;
					}
					header.nativeElement.style.transform = 'translate3d(0, ' + -this.data[name].scrollTop + 'px, 0)';
					supertabsToolbar.style.transform = 'translate3d(0, ' + -this.data[name].scrollTop + 'px, 0)';
				});
				content.ionScrollEnd.subscribe(() => {
					setTimeout(() => {
						// catch the last tick
						if (scrollContent.scrollTop === 0) {
							supertabsToolbar.style.position = 'static';
							scrollContent.style.paddingTop = this.data[name].paddingTop + 'px';
							tabscontentElem.nativeElement.style.top = null;
							tabsscrollContent.style.height = this.data[parent].tabscontentHeight + 'px';
							tabscontentElem.nativeElement.style.top = null;
						}
						this.data[name].scrolling = false;
						this.c(name);
					}, 10);
				});
			}, 100);
			contentElem.nativeElement.addEventListener('touchend', () => {
				this.data[name].tapping = false;
				this.c(name);
			});
			contentElem.nativeElement.addEventListener('touchstart', () => this.data[name].tapping = true);
		}
	}

	resetTabs(parent, name) {
		const header = this.data[parent].header;
		const tabscontentElem = this.data[parent].tabscontentElem;
		const supertabsToolbar: any = tabscontentElem.nativeElement.querySelector('super-tabs-toolbar');
		const tabsscrollContent: any = this.data[parent].tabscontentElem.nativeElement.shadowRoot.querySelector('.inner-scroll');
		const scrollContent: any = this.data[name].contentElem.nativeElement.shadowRoot.querySelector('.inner-scroll');
		scrollContent.scrollTop = scrollContent.scrollTop - this.data[name].scrollTop;
		setTimeout(() => {
			if (scrollContent.scrollTop === 0) {
				supertabsToolbar.style.position = 'static';
				scrollContent.style.paddingTop = this.data[name].paddingTop + 'px';
				tabscontentElem.nativeElement.style.top = null;
				tabsscrollContent.style.height = this.data[parent].tabscontentHeight + 'px';
				tabscontentElem.nativeElement.style.top = null;
			} else {
				const s = scrollContent.scrollTop;
				supertabsToolbar.style.position = 'absolute';
				supertabsToolbar.style.top = this.data[name].navheight + 'px';
				tabsscrollContent.style.height = (this.data[parent].tabscontentHeight + this.data[name].navheight) + 'px';
				tabscontentElem.nativeElement.style.top = '-' + this.data[name].navheight + 'px';
				scrollContent.style.paddingTop = this.data[name].paddingTop + supertabsToolbar.clientHeight + this.data[name].navheight + 'px';
				scrollContent.scrollTop = s;
			}
			header.nativeElement.style.transform = null;
			supertabsToolbar.style.transform = null;
		}, 20);

	}

	private c(name) {
		if (this.data[name].tapping || this.data[name].scrolling) {
			return false;
		}
		if (this.data[name].scrollTop === 0 || this.data[name].scrollTop === this.data[name].navheight) {
			return false;
		}
		const content = this.data[name].content;
		const scrollTopTemp = this.data[name].scrollTop;
		if (this.data[name].direction === 'down') {
			if (this.data[name].scrollTop < this.data[name].navheight) {
				content.scrollByPoint(0, (this.data[name].navheight - scrollTopTemp), (this.data[name].navheight - scrollTopTemp) * 6);
			}
		} else if (this.data[name].direction === 'up') {
			if (this.data[name].scrollTop < this.data[name].navheight) {
				content.scrollByPoint(0, -scrollTopTemp, scrollTopTemp * 6);
			}
		}
	}
}
