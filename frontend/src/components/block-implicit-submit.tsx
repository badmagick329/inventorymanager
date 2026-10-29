/**
 * Render as the first child of a `<form>` that wraps HeroUI `ModalContent` so
 * that Enter in a field does nothing.
 *
 * `ModalContent` renders React Aria's visually hidden Dismiss buttons inside
 * the form. They have no `type`, so they count as submit buttons and come
 * before the form's own, and Enter's implicit submission "clicks" the first
 * submit button: the modal closes and the typed values are lost. A disabled
 * submit button placed first becomes the form's default button instead, and
 * browsers skip implicit submission when the default button is disabled.
 * Explicit submits (the Create/Update button) and keys a field handles itself,
 * such as Enter on an Autocomplete option, are unaffected.
 */
export default function BlockImplicitSubmit() {
  return (
    <button
      type='submit'
      disabled
      hidden
      aria-hidden
    />
  );
}
