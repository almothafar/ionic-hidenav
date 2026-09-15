import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { JSDOM } from 'jsdom';

import { closestAncestorContaining, setAttributeOnMatches } from './hidenav-dom';

/**
 * These helpers replaced jQuery in v8.0.0. The point of these tests is to pin
 * down the *jQuery* semantics they were written to preserve, so the swap is
 * provably behaviour-neutral rather than merely compiling.
 */

let dom: JSDOM;

const html = (markup: string): Document => {
	dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`);
	// The helpers fall back to the ambient `document`, matching jQuery's
	// behaviour with an undefined context, so it has to be the jsdom one.
	(globalThis as any).document = dom.window.document;
	return dom.window.document;
};

const $ = (doc: Document, selector: string): Element => {
	const el = doc.querySelector(selector);
	assert.ok(el, `fixture is missing ${selector}`);
	return el;
};

describe('closestAncestorContaining', () => {
	it('returns the nearest ancestor whose subtree contains a match', () => {
		// jQuery's .parents() is ordered nearest-first, so the INNER wrapper wins
		// even though the outer one also contains a matching descendant.
		const doc = html(`
			<div id="outer">
				<div id="inner">
					<span data-target></span>
					<p id="start"></p>
				</div>
			</div>
		`);

		const found = closestAncestorContaining($(doc, '#start'), '[data-target]');

		assert.equal(found?.id, 'inner');
	});

	it('walks past ancestors that do not contain a match', () => {
		const doc = html(`
			<div id="outer">
				<span data-target></span>
				<div id="barren"><p id="start"></p></div>
			</div>
		`);

		const found = closestAncestorContaining($(doc, '#start'), '[data-target]');

		assert.equal(found?.id, 'outer');
	});

	it('returns null when no ancestor contains a match', () => {
		const doc = html(`<div><p id="start"></p></div>`);

		assert.equal(closestAncestorContaining($(doc, '#start'), '[data-target]'), null);
	});

	it('excludes the element itself, like jQuery .parents()', () => {
		// #start contains the only match, but .parents() never considers the
		// element itself — so this must NOT resolve to #start.
		const doc = html(`<div id="outer"><p id="start"><span data-target></span></p></div>`);

		const found = closestAncestorContaining($(doc, '#start'), '[data-target]');

		assert.equal(found?.id, 'outer');
	});

	it('stops at documentElement rather than throwing', () => {
		const doc = html(`<p id="start"></p>`);

		assert.equal(closestAncestorContaining($(doc, '#start'), '[data-target]'), null);
	});
});

describe('setAttributeOnMatches', () => {
	it('sets the attribute on every match, not just the first', () => {
		// jQuery's .attr(name, value) writes to the whole matched set.
		const doc = html(`
			<div id="scope">
				<span class="hit"></span>
				<span class="hit"></span>
				<span class="hit"></span>
			</div>
		`);

		setAttributeOnMatches($(doc, '#scope'), '.hit', 'hidenav-content', 'page0');

		const values = [...doc.querySelectorAll('.hit')].map(el => el.getAttribute('hidenav-content'));
		assert.deepEqual(values, ['page0', 'page0', 'page0']);
	});

	it('only touches matches inside the given root', () => {
		const doc = html(`
			<div id="scope"><span class="hit" id="in"></span></div>
			<div id="other"><span class="hit" id="out"></span></div>
		`);

		setAttributeOnMatches($(doc, '#scope'), '.hit', 'hidenav-content', 'page0');

		assert.equal($(doc, '#in').getAttribute('hidenav-content'), 'page0');
		assert.equal($(doc, '#out').getAttribute('hidenav-content'), null);
	});

	it('falls back to a document-wide search when the root is null', () => {
		// This mirrors jQuery: `$(sel, undefined)` searches the whole document.
		// The directives rely on it when no ancestor match is found.
		const doc = html(`<div><span class="hit" id="anywhere"></span></div>`);

		setAttributeOnMatches(null, '.hit', 'hidenav-sh-header', 'page0');

		assert.equal($(doc, '#anywhere').getAttribute('hidenav-sh-header'), 'page0');
	});

	it('is a no-op when nothing matches', () => {
		const doc = html(`<div id="scope"></div>`);

		assert.doesNotThrow(() =>
			setAttributeOnMatches($(doc, '#scope'), '.hit', 'hidenav-content', 'page0'));
	});

	it('overwrites an existing value', () => {
		const doc = html(`<div id="scope"><span class="hit" hidenav-content="stale"></span></div>`);

		setAttributeOnMatches($(doc, '#scope'), '.hit', 'hidenav-content', 'page1');

		assert.equal($(doc, '.hit').getAttribute('hidenav-content'), 'page1');
	});
});
