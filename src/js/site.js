/* Small progressive enhancements. The site works without JavaScript. */
(function () {
  'use strict';
  var link = document.getElementById('bookmarklet');
  if (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var msg = document.getElementById('bookmarklet-msg');
      if (msg) { msg.textContent = 'Drag this button to your bookmarks bar. Clicking it here does nothing.'; }
    });
  }
  var copy = document.getElementById('copy-code');
  var code = document.getElementById('bookmarklet-code');
  if (copy && code && navigator.clipboard) {
    copy.hidden = false;
    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(code.textContent).then(function () { copy.textContent = 'Copied'; });
    });
  }
}());
