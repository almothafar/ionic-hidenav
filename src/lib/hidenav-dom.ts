/**
 * Minimal DOM helpers replacing the jQuery calls this library used to depend on.
 *
 * These deliberately mirror the original jQuery semantics rather than tidying
 * them up, so the runtime behaviour of the final release is unchanged:
 *
 * - `closestAncestorContaining` mirrors
 *   `$(el).parents().get().find(itm => $(itm).find(sel).length)` — jQuery's
 *   `.parents()` is ordered nearest-first, so the first ancestor whose subtree
 *   contains a match wins.
 * - `setAttributeOnMatches` mirrors `$(sel, context).attr(name, value)`,
 *   including jQuery's behaviour of falling back to a document-wide search
 *   when the context is `undefined`, and of setting the attribute on *every*
 *   match rather than just the first.
 */

/** Nearest ancestor of `el` whose subtree contains an element matching `selector`. */
export const closestAncestorContaining = (el: Element, selector: string): Element | null => {
	let parent = el.parentElement;
	while (parent) {
		if (parent.querySelector(selector)) {
			return parent;
		}
		parent = parent.parentElement;
	}
	return null;
};

/** Set `attr` to `value` on every descendant of `root` matching `selector`. */
export const setAttributeOnMatches = (
	root: Element | Document | null | undefined,
	selector: string,
	attr: string,
	value: string
): void => {
	// jQuery treats a null/undefined context as "search the whole document".
	const scope: Element | Document = root ?? document;
	scope.querySelectorAll(selector).forEach(match => match.setAttribute(attr, value));
};
