/* Small progressive enhancements. The site works without JavaScript. */
(function () {
  'use strict';

  // Bookmarklet: explain that it must be dragged, not clicked.
  var link = document.getElementById('bookmarklet');
  if (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var msg = document.getElementById('bookmarklet-msg');
      if (msg) { msg.textContent = 'Drag this button to your bookmarks bar. Clicking it here does nothing.'; }
    });
  }

  // Copy buttons for the bookmarklet code and the command.
  function addCopy(sourceId, label, before) {
    var src = document.getElementById(sourceId);
    if (!src || !navigator.clipboard) { return; }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn secondary copy-btn';
    btn.textContent = label;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(src.textContent).then(function () {
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = label; }, 2500);
      });
    });
    src.parentNode.insertBefore(btn, before ? src : src.nextSibling);
  }
  var oldCopy = document.getElementById('copy-code');
  if (oldCopy) { oldCopy.remove(); }
  addCopy('bookmarklet-code', 'Copy bookmarklet code');
  addCopy('cli-code', 'Copy command');

  // Home demo: switch between the before and after versions of the product card.
  var demo = document.getElementById('demo');
  if (demo) {
    var seg = demo.querySelector('.seg');
    var buttons = seg ? seg.querySelectorAll('button') : [];
    if (buttons.length) {
      document.documentElement.classList.add('js');
      seg.hidden = false;
      Array.prototype.forEach.call(buttons, function (b) {
        b.addEventListener('click', function () {
          demo.setAttribute('data-state', b.getAttribute('data-set'));
          Array.prototype.forEach.call(buttons, function (o) {
            o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
          });
        });
      });
    }
  }
}());
