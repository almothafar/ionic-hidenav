# Hide Navigation Bar for Ionic

Auto-hiding and stretchable (collapsible) headers for Ionic + Angular.

[![npm version][npm-image]][npm-url] [![license](https://img.shields.io/npm/l/@almothafar/ionic-hidenav)](LICENSE.md) [![Angular](https://img.shields.io/badge/Angular-14%20%7C%2015-dd0031?logo=angular&logoColor=white)](#compatibility) [![Ionic](https://img.shields.io/badge/Ionic-6%20%7C%207-3880ff?logo=ionic&logoColor=white)](#compatibility) [![status: unmaintained](https://img.shields.io/badge/status-unmaintained-critical)](#-this-project-is-deprecated) [![CI](https://github.com/almothafar/ionic-hidenav/actions/workflows/ci.yml/badge.svg)](https://github.com/almothafar/ionic-hidenav/actions/workflows/ci.yml)

---

## 🪦 This project is deprecated

**`v8.0.0` is the final release. This package is no longer maintained, and this repository is archived.**

It still works on the versions listed below, and the source stays up for anyone pinned to it — but there will be no further releases, no Angular upgrades, and no bug fixes. Please migrate.

### Why

This library cannot move past **Angular 15**, and the reason is structural rather than a matter of effort:

- It depends on [`@ionic-super-tabs/angular`](https://www.npmjs.com/package/@ionic-super-tabs/angular) for its tabs support. That package was **last published in June 2020** and ships as a **View Engine** library (it has a `metadata.json` and `fesm5`/UMD bundles, with no partial-Ivy output).
- View Engine libraries can only be consumed via **ngcc**, and **ngcc was removed in Angular 16**.
- The tabs directives import it unconditionally, so it cannot simply be made optional without dropping half of the library's feature set.

On top of that, Ionic has since shipped a **first-party collapsible header** (`<ion-header collapse="condense">`, available since Ionic 5), which covers the main reason this library existed. Maintaining a jQuery-era shim against Ionic's private shadow-DOM internals is no longer a sensible trade.

---

## What to use instead

### 1. Collapsible / stretchable header → use Ionic's built-in `collapse="condense"`

No dependencies, first-party, and maintained. Add a second `ion-header` *inside* `ion-content`:

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>My Page</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <!-- This one collapses into the toolbar above as you scroll -->
  <ion-header collapse="condense">
    <ion-toolbar>
      <ion-title size="large">My Page</ion-title>
    </ion-toolbar>
  </ion-header>

  <!-- page content -->
</ion-content>
```

> **Note:** `collapse="condense"` renders in **iOS mode only**, mirroring native iOS large titles. `collapse="fade"` is also available. See the [ion-header docs](https://ionicframework.com/docs/api/header).

### 2. Hide header on scroll → a small standalone directive

Ionic has no first-party equivalent for this one, but it no longer needs a library. This is a complete, dependency-free replacement for the `hidenav-header` / `hidenav-content` pair, and it works on any modern Angular + Ionic:

```ts
import { AfterViewInit, Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { IonContent } from '@ionic/angular';

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
      this.headerHeight = this.header.clientHeight;
      this.header.style.willChange = 'transform';
      this.header.style.transition = 'transform 120ms ease-out';
    }
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
    this.offset = Math.min(Math.max(this.offset + delta, 0), this.headerHeight);
    this.header.style.transform = `translate3d(0, ${-this.offset}px, 0)`;
  }
}
```

> On Ionic 8+ standalone projects, import `IonContent` from `@ionic/angular/standalone` instead.

Usage:

```html
<ion-header>...</ion-header>
<ion-content hideHeaderOnScroll>...</ion-content>
```

### 3. Super tabs → `ion-segment` or `ion-tabs`

`@ionic-super-tabs` is itself unmaintained (last release June 2020). Use Ionic's own [`ion-tabs`](https://ionicframework.com/docs/api/tabs), or [`ion-segment`](https://ionicframework.com/docs/api/segment) paired with a swiper for swipeable tabs.

---

## Compatibility

Verified by building this repository against each combination:

| Angular | Ionic | Supported | Notes                                                       |
| ------- | ----- | :-------: | ----------------------------------------------------------- |
| 14      | 6 – 7 |     ✅    | Minimum. `v8.0.0` emits partial-Ivy with `minVersion 14.0.0`. |
| 15      | 6 – 7 |     ✅    | **Recommended ceiling** — last Angular release with ngcc.     |
| ≥ 16    | ≥ 8   |     ❌    | ngcc removed, so the View Engine tabs dependency cannot link. |
| ≤ 13    | ≤ 6   |     ❌    | Use [`v7.0.1`](https://www.npmjs.com/package/@almothafar/ionic-hidenav/v/7.0.1) for Angular 13. |

> The library's *own* code compiles fine on Angular 16+. It is the `@ionic-super-tabs/angular` dependency that hard-stops it at 15.

## Installation

```sh
npm i @almothafar/ionic-hidenav
```

## What changed in `v8.0.0` (final release)

The farewell release — all housekeeping, no new features:

- **Removed the jQuery runtime dependency.** It was used for a handful of `attr()` / `closest()` / `parents()` calls, now replaced with equivalent native DOM in `src/lib/hidenav-dom.ts`. This drops ~30 KB gzipped from every consumer bundle.
- **Removed all `eval()` usage.** Three call sites passed code as strings to poll for element dimensions; they are plain closures now, so the library works under a strict Content-Security-Policy and no longer trips the bundler's `eval` warnings.
- **Fixed `npm run build:prod`**, which was broken: `tsconfig.lib.prod.json` still set the removed View Engine flag `enableIvy: false`. It now builds in `compilationMode: "partial"`, the correct Angular Package Format output for a published library.
- **Fixed `npm run build`**, which pointed at `package.json` instead of `ng-package.json`.
- **Removed the `ModuleWithProviders` global type patch**, an Angular 8-era workaround that broke compilation on Angular 15+.
- **Pinned every dependency.** The toolchain previously used `"latest"` for Angular and the CLI, so a fresh `npm install` would pull Angular 22 against an Angular 13 codebase and fail immediately.
- **Widened peer ranges** to Angular 14–15 and Ionic 6–7, and dropped the peer-dependency conflicts (installs cleanly without `--legacy-peer-deps`).
- Replaced the dead, broken Karma scaffolding (no specs existed; its `core-js/es7` and `zone.js/dist` imports no longer resolved) with unit tests for the new DOM helper, run on Node's built-in test runner against jsdom — `npm test`. They pin the jQuery semantics the helper preserves, and each was checked by mutation to confirm it actually fails when the behaviour changes.
- Scoped linting to `src/`, and added CI running lint, tests and the production build.

---

# Original documentation

<details>
<summary>The original usage docs, kept for anyone still pinned to this package (click to expand)</summary>

With this module you can:
- implement an expansible header that stretches when pulling the page down
- auto-hide the page header when scrolling down

### 🔥 ..Also works with Supertabs 🔥

![](https://github.com/heidji/readme-content/blob/master/ionic4hidenav.gif?raw=true)

Check out the [example](https://github.com/heidji/ionic4-hidenav-example)

#### Note:
_Both should not be used together on the same page, either you want to make room for reading content or you want to add an expansible header, not both together :)_

_This plugin is also made as generic as possible, making it maybe a bit harder to setup but giving the user much more freedom to design what he wants._

## Implementation

Create (or modify if you already have) a **shared.module.ts** in your project root folder:

```typescript
import { NgModule } from '@angular/core';
import { HidenavModule } from '@almothafar/ionic-hidenav';

@NgModule({
    imports: [HidenavModule],
    exports: [HidenavModule]
})
export class SharedModule { }
```
and import the SharedModule on every page you intend to use this plugin:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { SharedModule } from '../shared.module';

const routes: Routes = [
    {
        path: '',
        component: HomePage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    declarations: [HomePage]
})
export class HomePageModule {
}
```
---

## Part 1: Expansible header
This is a custom component defined using this HTML tag:
```html
<hidenav-stretchheader></hidenav-stretchheader>
```
This component must be defined outside of `<ion-content>` and comes with required and optional child DOM elements:

## Creating the expansible header element

**home.page.html**

`#shrinkexpand`: This is the element that will shrink and expand with scrolling the page `#static`: Element(s) with this tag will be left alone. You can use these to create buttons on your header for example.

```html
<hidenav-stretchheader header-height="50">
    <div #shrinkexpand><!-- Expanding DOM element --></div>
    <div #static><!-- Title --></div>
    <div #static><!-- Nav button --></div>
</hidenav-stretchheader>
```

Inputs for `<hidenav-stretchheader>`:

| input             | type                         | Description                                                                    |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `header-height`   | **required**                 | height to which the header shrinks to                                          |
| `opacity-factor`  | optional / default = 0       | `1 - 10` opacity of shrunk header overlay                                      |
| `opacity-color`   | optional / default = black   | accepts any css color description (name, rgb, # ..)                            |
| `blur-factor`     | optional / default = 0       | the maximum blur when the header is collapsed (accepts integer)                |
| `init-expanded`   | optional / default = false   | set to `true` if you want the header to initiate expanded                      |
| `no-border`       | optional / default = false   | set to `true` if you want to remove the bottom styling of the header           |
| Tabspage params only:                                                                                                             |
| `preserve-header` | optional / default = false   | set to `true` if you want to keep the header state separate on each tab        | 

### Adding your Header to a simple page: 
add the `hidenav-sh-content` directive to your `<ion-content>`
````html
<hidenav-stretchheader header-height="50">
    <div #shrinkexpand>...</div>
</hidenav-stretchheader>
<ion-content hidenav-sh-content>
    ....
</ion-content>
````

### Adding your Header to a Supertabs Page:
You need to give the the `<ion-content>` that holds the `<super-tabs>` element the directive `hidenav-sh-tabscontent` then you need to add to each `<ion-content>` on every tab two directives: `hidenav-sh-content` and `hidenav-tabspage`
````html
<hidenav-stretchheader header-height="50">
  <div #shrinkexpand style="background: darkblue; color: gold" (click)="expand()" >...</div>
</hidenav-stretchheader>
<ion-content hidenav-sh-tabscontent>
  <super-tabs>
    <super-tabs-toolbar slot="top">
      <super-tab-button>...</super-tab-button>
      <super-tab-button>...</super-tab-button>
    </super-tabs-toolbar>
    <super-tabs-container>
      <super-tab>
        <ion-content hidenav-sh-content hidenav-tabspage>...</ion-content>
      </super-tab>
      <super-tab>
        <ion-content hidenav-sh-content hidenav-tabspage>...</ion-content>
      </super-tab>
    </super-tabs-container>
  </super-tabs>
</ion-content>
````

### Events: 
you can subscribe to the `(scroll)` event for example like:
```html
<hidenav-stretchheader (scroll)="handleScrollEvent($event)">...</hidenav-stretchheader>
```
The **$event** variable returns the current header height.
### Functions:

- `expand(duration)`: scrolls content to top and expands the header.
- `shrink(duration)`: scrolls just about enought to shrink the header if it is expanded.
- `toggle(duration)`: toggles between `expand()` and `shrink()`.

Note that `duration` is optional and defaults to 200.

---
## Part 2: Hide Header on scroll
This function is fairly simple to implement than the previous one, all you will have to do is define directives `hidenav-header` and `hidenav-content` in the page you want to use.

### Adding the hidenav component to a simple page
In the following example, both header and content carry the previously mentioned directives.
```html
<ion-header hidenav-header>...</ion-header>
<ion-content hidenav-content>...</ion-content>
```

### Adding the hidenav component to a Supertabs page
Give the `<ion-header>` the `hidenav-header` directive and the `<ion-content>` that holds the `<super-tabs>` component the directive `hidenav-tabscontent`. As for the `<ion-content>` elements in each of the tabs give them the `hidenav-content` and `hidenav-tabspage` directive.
````html
<ion-header hidenav-header>...</ion-header>
<ion-content hidenav-tabscontent>
  <super-tabs>
    <super-tabs-toolbar slot="top">
      <super-tab-button>...</super-tab-button>
      <super-tab-button>...</super-tab-button>
    </super-tabs-toolbar>
    <super-tabs-container>
      <super-tab>
        <ion-content hidenav-content hidenav-tabspage>...</ion-content>
      </super-tab>
      <super-tab>
        <ion-content hidenav-content hidenav-tabspage>...</ion-content>
      </super-tab>
    </super-tabs-container>
  </super-tabs>
</ion-content>

````

**PS**.: as mentioned in the beginning, you should not use both methods (Part1 and Part2) together on one page. It was never tested and is not intended to be used.

</details>

---

## Credits

This is a fork of [heidji/ionic4-hidenav](https://github.com/heidji/ionic4-hidenav), maintained here for Angular 11–15 after the original went quiet. Thanks to [@heidji](https://github.com/heidji) for the original work.

## License

[MIT](LICENSE.md)

[npm-url]: https://npmjs.org/package/@almothafar/ionic-hidenav
[npm-image]: https://img.shields.io/npm/v/@almothafar/ionic-hidenav/latest
