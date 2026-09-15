import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class HidenavShService {

	data = [];
	mode: any = 'ios';
	names = [];
	tabnames = [];
	scroll: any;

	constructor() {
		this.scroll = new Subject();
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
			&& (this.data[name].parent
				&& this.data[this.data[name].parent]
				&& this.data[this.data[name].parent].tabscontent
				&& this.data[name].content
				&& this.data[this.data[name].parent].header)
			|| (!this.data[name].parent && this.data[name].content && this.data[name].header))
		) {
			return false;
		}
		const parent = this.data[name].parent;
		const content = this.data[name].content;
		if (!this.data[name].lastscroll) {
			this.data[name].lastscroll = 0;
		}
		if (!this.data[name].guardEvents) {
			this.data[name].guardEvents = true;
		}
		content.scrollEvents = true;
		if (!parent) {
			const header = this.data[name].header;
			if (this.data[name].static) {
				this.data[name].static.forEach(el => {
					el.nativeElement.style.position = 'absolute';
					el.nativeElement.style.zIndex = 102;
				});
			}

			if (header) {
				const parentElem = header.nativeElement.parentNode;
				const elem = header.nativeElement;
				if (parentElem.getAttribute('init-expanded') === 'true') {
					this.data[name].initExpanded = true;
				}
				// Defensive: Ionic's core CSS defines --ion-safe-area-top (resolving to
				// 0px without a notch), but if that stylesheet is absent the variable is
				// empty and parseInt('') would make the header height NaN.
				const notchHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-top'), 10) || 0;
				this.data[name].shrinkexpandheaderHeight = parseInt(parentElem.getAttribute('header-height'), 10) + notchHeight;
				this.data[name].opacityFactor = parseInt(parentElem.getAttribute('opacity-factor'), 10);
				this.data[name].opacityColor = parentElem.getAttribute('opacity-color');
				this.data[name].blurFactor = parseInt(parentElem.getAttribute('blur-factor'), 10);
				parentElem.style.height = this.data[name].shrinkexpandheaderHeight + 'px';
				parentElem.style.overflow = 'hidden';
				parentElem.style.position = 'absolute';
				elem.style.position = 'absolute';
				parentElem.style.width = '100%';
				elem.style.width = '100%';
				this.waitforelem(name, () => this.data[name].header.nativeElement.scrollHeight, 'proceedShrinkExpand');
			}
		} else if (parent) {
			const header = this.data[parent].header;
			const tabscontentElem = this.data[parent].tabscontentElem;
			if (this.data[parent].static) {
				this.data[parent].static.forEach(el => {
					el.nativeElement.style.position = 'absolute';
					el.nativeElement.style.zIndex = 102;
				});
			}

			if (header) {
				const supertabsToolbar: any = tabscontentElem.nativeElement.querySelector('super-tabs-toolbar');
				const parentElem = header.nativeElement.parentNode;
				const elem = header.nativeElement;
				if (parentElem.getAttribute('init-expanded') === 'true') {
					this.data[name].initExpanded = true;
				}
				if (parentElem.getAttribute('preserve-header') === 'true') {
					this.data[name].preserveHeader = true;
					this.data[parent].preserveHeader = true;
				}
				// Defensive: Ionic's core CSS defines --ion-safe-area-top (resolving to
				// 0px without a notch), but if that stylesheet is absent the variable is
				// empty and parseInt('') would make the header height NaN.
				const notchHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-top'), 10) || 0;
				this.data[name].shrinkexpandheaderHeight = parseInt(parentElem.getAttribute('header-height'), 10) + notchHeight;
				this.data[name].opacityFactor = parseInt(parentElem.getAttribute('opacity-factor'), 10);
				this.data[name].opacityColor = elem.getAttribute('opacity-color');
				this.data[name].blurFactor = parseInt(parentElem.getAttribute('blur-factor'), 10);
				parentElem.style.height = this.data[name].shrinkexpandheaderHeight + 'px';
				parentElem.style.overflow = 'hidden';
				parentElem.style.position = 'absolute';
				elem.style.position = 'absolute';
				parentElem.style.width = '100%';
				elem.style.width = '100%';
				supertabsToolbar.style.position = 'absolute';
				supertabsToolbar.style.transform = 'translate3d(0, ' + this.data[name].shrinkexpandheaderHeight + 'px, 0)';
				parentElem.style.zIndex = 101;
				this.waitforelemTabs(
					name,
					() => this.data[this.data[name].parent].header.nativeElement.scrollHeight,
					() => this.data[this.data[name].parent].tabscontentElem.nativeElement
						.querySelector('super-tabs-toolbar').clientHeight,
					'proceedShrinkExpandTabs');
			}
		}
	}

	// `measure` used to be a code string passed through eval(); it is now a plain
	// closure, so the library works under a strict Content-Security-Policy.
	waitforelem(name, measure: () => number, func) {
		const x = measure();
		if (x < this.data[name].shrinkexpandheaderHeight) {
			window.requestAnimationFrame(this.waitforelem.bind(this, name, measure, func));
		} else {
			this[func](name);
		}
	}

	waitforelemTabs(name, measure: () => number, measureTabs: () => number, func) {
		const x = measure();
		const y = measureTabs();
		if (x < this.data[name].shrinkexpandheaderHeight || y === 0) {
			window.requestAnimationFrame(this.waitforelemTabs.bind(this, name, measure, measureTabs, func));
		} else {
			this[func](name);
		}
	}

	proceedShrinkExpand(name) {
		const parentElem = this.data[name].header.nativeElement.parentNode;
		const elem = this.data[name].header.nativeElement;
		const overlay = this.data[name].header.nativeElement.parentNode.querySelector('.overlay');
		if (this.data[name].opacityColor) {
			overlay.style.setProperty('--color', this.data[name].opacityColor);
		}
		if (this.data[name].opacityFactor > 0) {
			// angular decides that opacity is bad and changes it to alpha which doesn't work lol
			overlay.style.setProperty('filter', 'opacity(var(--opacity))');
			overlay.style.setProperty('--opacity', this.data[name].opacityFactor / 10);
		}
		if (this.data[name].blurFactor > 0) {
			elem.style.setProperty('filter', 'blur(var(--blur))');
			elem.style.setProperty('--blur', this.data[name].blurFactor / 10);
		}
		this.data[name].shrinkexpandHeight = this.data[name].shrinkexpandheaderHeight;
		this.data[name].shrinkexpandHeight = this.data[name].header.nativeElement.scrollHeight;
		elem.style.transform = 'translate3d(0, ' + -((this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight) / 2) + 'px, 0)';
		this.data[name].content.getScrollElement().then(res => {
			this.data[name].contentElem = res;
			this.data[name].paddingTop = parseInt(window.getComputedStyle(this.data[name].contentElem)['padding-top'], 10);
			this.data[name].contentElem.style.paddingTop = (this.data[name].shrinkexpandHeight + this.data[name].paddingTop) + 'px';
			// this.data[name].contentElem.style.marginTop = this.data[name].shrinkexpandheaderHeight + 'px';
			const elemPad = document.createElement('div');
			elemPad.style.cssText = 'background:rgba(0,0,0,0)';
			const x = this.data[name].contentElem.scrollHeight + (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight);
			// experimental height
			elemPad.style.height = x + 'px';
			setTimeout(() => {
				// check if height is still ok and adjust if not
				this.data[name].elemPadHeight = Math.max(0,
					(x - (this.data[name].contentElem.scrollHeight - this.data[name].contentElem.offsetHeight)
						+ (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight)
					));
				elemPad.style.height = this.data[name].elemPadHeight + 'px';
			}, 100);
			this.data[name].contentElem.appendChild(elemPad);
			const scrollDist = this.data[name].initExpanded ? 2 : (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight);
			this.data[name].content.scrollByPoint(0, scrollDist, 0).then(() => {
				this.data[name].contentHeight = this.data[name].contentEl.nativeElement.clientHeight;
				this.data[name].content.scrollEvents = true;
				this.data[name].content.ionScroll.subscribe(e => {
					if (e.detail.scrollTop === 0) {
						this.data[name].contentElem.style.paddingTop = 0;
						this.data[name].contentEl.nativeElement.style.height = (this.data[name].contentHeight - this.data[name].shrinkexpandHeight) + 'px';
						this.data[name].contentEl.nativeElement.style.top = (this.data[name].shrinkexpandHeight + this.data[name].paddingTop) + 'px';
						elemPad.style.height = (this.data[name].elemPadHeight + this.data[name].shrinkexpandHeight + this.data[name].paddingTop) + 'px';
					} else {
						const s = e.detail.scrollTop;
						this.data[name].contentElem.style.paddingTop = (this.data[name].shrinkexpandHeight + this.data[name].paddingTop) + 'px';
						this.data[name].contentEl.nativeElement.style.height = (this.data[name].contentHeight + this.data[name].shrinkexpandHeight) + 'px';
						this.data[name].contentEl.nativeElement.style.top = null;
						this.data[name].contentElem.scrollTop = s;
						elemPad.style.height = this.data[name].elemPadHeight + 'px';
					}
					if (this.data[name].initExpanded) {
						this.data[name].content.scrollToPoint(0, 0, 0).then(() => {
							this.data[name].initExpanded = false;
						});
					}
					if (this.data[name].initExpanded) {
						this.data[name].content.scrollToPoint(0, 0, 0).then(() => {
							this.data[name].initExpanded = false;
						});
					}
					// eslint-disable-next-line max-len
					const height = Math.max(Math.min(this.data[name].shrinkexpandHeight, this.data[name].shrinkexpandHeight - e.detail.scrollTop), this.data[name].shrinkexpandheaderHeight);
					// eslint-disable-next-line max-len
					elem.style.transform = 'translate3d(0, ' + -(Math.min((this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight) / 2, e.detail.scrollTop / 2)) + 'px, 0)';
					parentElem.style.height = height + 'px';
					const scrollFactor = Math.min(e.detail.scrollTop / (this.data[name].shrinkexpandHeight / 2), 1);
					if (scrollFactor >= 0) {
						const currentValOpacity = overlay.style.getPropertyValue('--opacity');
						const newValOpacity = this.data[name].opacityFactor / 10 * scrollFactor;
						if (currentValOpacity !== newValOpacity) {
							overlay.style.setProperty('--opacity', newValOpacity);
						}
						const currentValBlur = elem.style.getPropertyValue('--blur');
						const newValBlur = (this.data[name].blurFactor * scrollFactor) + 'px';
						if (currentValBlur !== newValBlur) {
							elem.style.setProperty('--blur', newValBlur);
						}
					}
					// event emitter
					setTimeout(() => {
						this.data[name].guardEvents = false;
					}, 10);
					if (this.data[name].lastscroll !== height && !this.data[name].guardEvents) {
						this.scroll.next({name: this.data[name].parent ? this.data[name].parent : name, height});
					}
					this.data[name].lastscroll = height;
					//
				});
				// catch the last tick
				this.data[name].content.ionScrollEnd.subscribe(() => {
					setTimeout(() => {
						if (this.data[name].contentElem.scrollTop === 0) {
							this.data[name].contentElem.style.paddingTop = 0;
							this.data[name].contentEl.nativeElement.style.height = (this.data[name].contentHeight - this.data[name].shrinkexpandHeight) + 'px';
							this.data[name].contentEl.nativeElement.style.top = (this.data[name].shrinkexpandHeight + this.data[name].paddingTop) + 'px';
							elemPad.style.height = (this.data[name].elemPadHeight + this.data[name].shrinkexpandHeight + this.data[name].paddingTop) + 'px';
						}
					}, 10);
				});
			});
		});
	}

	proceedShrinkExpandTabs(name) {
		const parent = this.data[name].parent;
		const parentElem = this.data[parent].header.nativeElement.parentNode;
		const elem = this.data[parent].header.nativeElement;
		const tabscontentElem = this.data[parent].tabscontentElem;
		const supertabsToolbar: any = tabscontentElem.nativeElement.querySelector('super-tabs-toolbar');
		const overlay = this.data[parent].header.nativeElement.parentNode.querySelector('.overlay');
		if (this.data[name].opacityColor) {
			overlay.style.setProperty('--color', this.data[name].opacityColor);
		}
		if (this.data[name].opacityFactor > 0) {
			// angular decides that opacity is bad and changes it to alpha which doesn't work lol
			overlay.style.setProperty('filter', 'opacity(var(--opacity))');
			overlay.style.setProperty('--opacity', this.data[name].opacityFactor / 10);
		}
		if (this.data[name].blurFactor > 0) {
			elem.style.setProperty('filter', 'blur(var(--blur))');
			elem.style.setProperty('--blur', this.data[name].blurFactor / 10);
		}
		this.data[name].shrinkexpandHeight = this.data[name].shrinkexpandheaderHeight;
		this.data[name].shrinkexpandHeight = elem.scrollHeight;
		elem.style.transform = 'translate3d(0, ' + -((this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight) / 2) + 'px, 0)';
		this.data[name].content.getScrollElement().then(res => {
			this.data[name].contentElem = res;
			this.data[name].paddingTop = parseInt(window.getComputedStyle(this.data[name].contentElem)['padding-top'], 10);
			this.data[name].contentElem.style.paddingTop = (this.data[name].shrinkexpandHeight + supertabsToolbar.clientHeight + this.data[name].paddingTop) + 'px';
			this.data[name].contentElem.style.height = (this.data[parent].tabscontentElem.nativeElement.clientHeight) + 'px';
			// this.data[name].contentElem.style.marginTop = this.data[name].shrinkexpandheaderHeight + 'px';
			const elemPad = document.createElement('div');
			elemPad.style.cssText = 'background:rgba(0,0,0,0)';
			const x = this.data[name].contentElem.scrollHeight + (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight);
			// experimental height
			elemPad.style.height = x + 'px';
			setTimeout(() => {
				// check if height is still ok and adjust if not
				this.data[name].elemPadHeight = Math.max(
					0, (x - (this.data[name].contentElem.scrollHeight - this.data[name].contentElem.offsetHeight)
						+ (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight)
					)
				);
				elemPad.style.height = this.data[name].elemPadHeight + 'px';
			}, 100);
			this.data[name].contentElem.appendChild(elemPad);
			const scrollDist = this.data[name].initExpanded ? 2 : (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight);
			this.data[name].content.scrollByPoint(0, scrollDist, 0).then(() => {
				this.data[name].contentHeight = this.data[name].contentEl.nativeElement.clientHeight;
				this.data[name].content.scrollEvents = true;
				this.data[name].content.ionScroll.subscribe(e => {
					if (e.detail.scrollTop === 0) {
						this.data[name].contentElem.style.paddingTop = 0;
						// eslint-disable-next-line max-len
						this.data[name].contentEl.nativeElement.style.height = (this.data[name].contentHeight - (this.data[name].shrinkexpandHeight + supertabsToolbar.clientHeight)) + 'px';
						// eslint-disable-next-line max-len
						this.data[name].contentEl.nativeElement.style.top = (this.data[name].shrinkexpandHeight + supertabsToolbar.clientHeight + this.data[name].paddingTop) + 'px';
						// eslint-disable-next-line max-len
						elemPad.style.height = (this.data[name].elemPadHeight + this.data[name].shrinkexpandHeight + this.data[name].paddingTop + supertabsToolbar.clientHeight) + 'px';
					} else {
						const s = e.detail.scrollTop;
						this.data[name].contentElem.style.paddingTop = (this.data[name].shrinkexpandHeight + supertabsToolbar.clientHeight + this.data[name].paddingTop) + 'px';
						// eslint-disable-next-line max-len
						this.data[name].contentEl.nativeElement.style.height = (this.data[name].contentHeight + this.data[name].shrinkexpandHeight + supertabsToolbar.clientHeight) + 'px';
						this.data[name].contentEl.nativeElement.style.top = null;
						this.data[name].contentElem.scrollTop = s;
						elemPad.style.height = this.data[name].elemPadHeight + 'px';
					}
					if (this.data[name].initExpanded) {
						this.data[name].content.scrollToPoint(0, 0, 0).then(() => {
							this.data[name].initExpanded = false;
						});
					}
					// eslint-disable-next-line max-len
					const height = Math.max(Math.min(this.data[name].shrinkexpandHeight, this.data[name].shrinkexpandHeight - e.detail.scrollTop), this.data[name].shrinkexpandheaderHeight);
					// eslint-disable-next-line max-len
					elem.style.transform = 'translate3d(0, ' + -(Math.min((this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight) / 2, e.detail.scrollTop / 2)) + 'px, 0)';
					parentElem.style.height = height + 'px';
					const scrollFactor = Math.min(e.detail.scrollTop / (this.data[name].shrinkexpandHeight / 2), 1);
					if (scrollFactor >= 0) {
						const currentValOpacity = overlay.style.getPropertyValue('--opacity');
						const newValOpacity = this.data[name].opacityFactor / 10 * scrollFactor;
						if (currentValOpacity !== newValOpacity) {
							overlay.style.setProperty('--opacity', newValOpacity);
						}
						const currentValBlur = elem.style.getPropertyValue('--blur');
						const newValBlur = (this.data[name].blurFactor * scrollFactor) + 'px';
						if (currentValBlur !== newValBlur) {
							elem.style.setProperty('--blur', newValBlur);
						}
					}
					supertabsToolbar.style.transform = 'translate3d(0, ' + height + 'px, 0)';
					// event emitter
					setTimeout(() => {
						this.data[name].guardEvents = false;
					}, 10);
					if (this.data[name].lastscroll !== height && !this.data[name].guardEvents) {
						this.scroll.next({name: this.data[name].parent ? this.data[name].parent : name, height});
					}
					this.data[name].lastscroll = height;
					//
				});
				// catch the last tick
				this.data[name].content.ionScrollEnd.subscribe(() => {
					setTimeout(() => {
						if (this.data[name].contentElem.scrollTop === 0) {
							this.data[name].contentElem.style.paddingTop = 0;
							// eslint-disable-next-line max-len
							this.data[name].contentEl.nativeElement.style.height = (this.data[name].contentHeight - (this.data[name].shrinkexpandHeight + supertabsToolbar.clientHeight)) + 'px';
							// eslint-disable-next-line max-len
							this.data[name].contentEl.nativeElement.style.top = (this.data[name].shrinkexpandHeight + supertabsToolbar.clientHeight + this.data[name].paddingTop) + 'px';
							// eslint-disable-next-line max-len
							elemPad.style.height = (this.data[name].elemPadHeight + this.data[name].shrinkexpandHeight + this.data[name].paddingTop + supertabsToolbar.clientHeight) + 'px';
						}
					}, 10);
				});
			});
		});
	}

	resetContent(name) {
		if (!this.data[name].preserveHeader) {
			const parent = this.data[name].parent;
			const height = parseInt(this.data[parent].header.nativeElement.parentNode.style.height, 10);
			if (height <= this.data[name].shrinkexpandHeight && height > this.data[name].shrinkexpandheaderHeight
				|| height === this.data[name].shrinkexpandheaderHeight
				&& this.data[name].contentElem.scrollTop < (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight)) {
				this.data[name].contentElem.scrollTop = this.data[name].shrinkexpandHeight - height;
			}
		} else {
			const parent = this.data[name].parent;
			const parentElem = this.data[parent].header.nativeElement.parentNode;
			const elem = this.data[parent].header.nativeElement;
			const tabscontentElem = this.data[parent].tabscontentElem;
			const supertabsToolbar: any = tabscontentElem.nativeElement.querySelector('super-tabs-toolbar');
			const overlay = this.data[parent].header.nativeElement.parentNode.querySelector('.overlay');
			const height = Math.max(
				Math.min(this.data[name].shrinkexpandHeight, this.data[name].shrinkexpandHeight - this.data[name].contentElem.scrollTop), this.data[name].shrinkexpandheaderHeight
			);
			elem.style.transform = 'translate3d(0, ' + -(Math.min(
				(this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight) / 2, this.data[name].contentElem.scrollTop / 2)
			) + 'px, 0)';
			parentElem.style.height = height + 'px';
			// eslint-disable-next-line max-len
			overlay.style.setProperty('--opacity', this.data[name].opacityFactor / 10 * Math.min(this.data[name].contentElem.scrollTop / (this.data[name].shrinkexpandHeight / 2), 1));
			elem.style.setProperty('--blur', (this.data[name].blurFactor * Math.min(this.data[name].contentElem.scrollTop / (this.data[name].shrinkexpandHeight / 2), 1)) + 'px');
			supertabsToolbar.style.transform = 'translate3d(0, ' + height + 'px, 0)';
			this.scroll.next({name: this.data[name].parent, height});
		}
	}

	findCurrentTab(parent) {
		const i = this.data[parent].supertabs.activeTabIndex;
		const tabs = this.data[parent].tabscontentElem.nativeElement.querySelectorAll('super-tab');
		const results = [];
		for (const tab of tabs) {
			const cont = tab.querySelector('ion-content');
			if (cont.attributes['hidenav-sh-content']) {
				results.push(cont.attributes['hidenav-sh-content'].nodeValue);
			} else {
				results.push(null);
			}
		}
		if (results[i] != null) {
			return results[i];
		}
		return null;
	}

	public expand(parent, duration = 200) {
		if (this.data[parent].content) {
			this.data[parent].content.scrollToPoint(0, 0, duration);
		} else {
			if (!this.data[parent].preserveHeader) {
				const names = [];
				for (const key in this.data) {
					if (this.data[key].parent === parent) {
						names.push(key);
					}
				}
				for (const name of names) {
					this.data[name].content.scrollToPoint(0, 0, duration);
				}
			} else {
				const currentTab = this.findCurrentTab(parent);
				this.data[currentTab].content.scrollToPoint(0, 0, duration);
			}
		}
	}

	public shrink(parent, duration = 200) {
		const height = parseInt(this.data[parent].header.nativeElement.parentNode.style.height, 10);
		if (height > this.data[parent].shrinkexpandheaderHeight) {
			if (this.data[parent].content) {
				this.data[parent].content.scrollToPoint(0, (this.data[parent].shrinkexpandHeight - this.data[parent].shrinkexpandheaderHeight), duration);
			} else {
				if (!this.data[parent].preserveHeader) {
					const names = [];
					for (const key in this.data) {
						if (this.data[key].parent === parent) {
							names.push(key);
						}
					}
					for (const name of names) {
						this.data[name].content.scrollToPoint(0, (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight), duration);
					}
				} else {
					const currentTab = this.findCurrentTab(parent);
					this.data[currentTab].content.scrollToPoint(0, (this.data[currentTab].shrinkexpandHeight - this.data[currentTab].shrinkexpandheaderHeight), duration);
				}
			}
		}
	}

	public toggle(parent, duration = 200) {
		if (this.data[parent].content) {
			const height = parseInt(this.data[parent].header.nativeElement.parentNode.style.height, 10);
			if (height < this.data[parent].shrinkexpandHeight) {
				this.data[parent].content.scrollToPoint(0, 0, duration);
			} else {
				this.data[parent].content.scrollToPoint(0, (this.data[parent].shrinkexpandHeight - this.data[parent].shrinkexpandheaderHeight), duration);
			}

		} else {
			if (!this.data[parent].preserveHeader) {
				const names = [];
				for (const key in this.data) {
					if (this.data[key].parent === parent) {
						names.push(key);
					}
				}
				const height = parseInt(this.data[parent].header.nativeElement.parentNode.style.height, 10);
				for (const name of names) {
					if (height < this.data[name].shrinkexpandHeight) {
						this.data[name].content.scrollToPoint(0, 0, duration);
					} else {
						this.data[name].content.scrollToPoint(0, (this.data[name].shrinkexpandHeight - this.data[name].shrinkexpandheaderHeight), duration);
					}
				}
			} else {
				const currentTab = this.findCurrentTab(parent);
				const height = parseInt(this.data[parent].header.nativeElement.parentNode.style.height, 10);

				if (height < this.data[currentTab].shrinkexpandHeight) {
					this.data[currentTab].content.scrollToPoint(0, 0, duration);
				} else {
					this.data[currentTab].content.scrollToPoint(0, (this.data[currentTab].shrinkexpandHeight - this.data[currentTab].shrinkexpandheaderHeight), duration);
				}

			}
		}
	}
}
