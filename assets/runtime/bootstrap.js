(() => {
  if (new URLSearchParams(location.search).has('noinfo')) {
    document.documentElement.classList.add('noinfo-mode');
  }
})();
