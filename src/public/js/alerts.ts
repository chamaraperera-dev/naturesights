export const hideAlert = () => {
  const el = document.querySelector('.alert');
  // Move one level up to parent element and remove child element
  if (el) el.parentElement?.removeChild(el);
};

export const showAlert = (type: string, msg: string) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body')?.insertAdjacentHTML('afterbegin', markup);
  //Hide alert after 5 seconds
  window.setTimeout(hideAlert, 5000);
};
