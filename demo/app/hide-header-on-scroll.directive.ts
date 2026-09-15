import { AfterViewInit, Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { IonContent } from '@ionic/angular';

/**
 * The modern, dependency-free replacement documented in the README.
 *
 * It lives in the demo so the migration snippet people copy is the exact code
 * the e2e suite exercises, rather than an untested block of markdown.
 */
@Directive({
	selector: 'ion-content[hideHeaderOnScroll]',
	standalone: true,
})
export class HideHeaderOnScrollDirective implements AfterViewInit {
	/** CSS selector for the header to hide, resolved within the current page. */
	@Input() headerSelector = 'ion-header';

	private readonly content = inject(IonContent, { self: true });
	private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
	private header: HTMLElement | null = null;
	private headerHeight = 0;
	private offset = 0;
	private lastTop = 0;

	ngAfterViewInit(): void {
		// ion-content only emits ionScroll when scroll events are enabled.
		this.content.scrollEvents = true;

		const page: Element | Document = this.host.closest('.ion-page') ?? document;
		this.header = page.querySelector<HTMLElement>(this.headerSelector);

		if (this.header) {
			this.header.style.willChange = 'transform';
			this.header.style.transition = 'transform 120ms ease-out';
		}
	}

	/**
	 * Measured lazily: Ionic's web components hydrate after ngAfterViewInit, so
	 * reading clientHeight there yields 0 and clamps every offset to nothing.
	 */
	private get height(): number {
		if (!this.headerHeight && this.header) {
			this.headerHeight = this.header.clientHeight;
		}
		return this.headerHeight;
	}

	@HostListener('ionScroll', ['$event'])
	protected onScroll(ev: CustomEvent<{ scrollTop: number }>): void {
		if (!this.header) {
			return;
		}

		const top = Math.max(ev.detail.scrollTop, 0);
		const delta = top - this.lastTop;
		this.lastTop = top;

		// Accumulate scroll delta, clamped to the header's height, so the header
		// follows the finger in both directions instead of snapping.
		this.offset = Math.min(Math.max(this.offset + delta, 0), this.height);
		this.header.style.transform = `translate3d(0, ${-this.offset}px, 0)`;
	}
}
