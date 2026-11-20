/* Fixlist in-browser accessibility check.
 * Runs entirely on the page the user is viewing. It makes no network requests
 * other than loading axe-core from the same origin as this script, and it sends
 * nothing anywhere. RULES is injected at build time from data/rules.json. */
(function () {
  'use strict';
  var RULES = /*__RULES__*/ {};
  var TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
  var ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  var VERSION = '0.1.0';

  if (document.getElementById('fixlist-root')) { return; }
  var script = document.currentScript;
  var base = script && script.src ? new URL(script.src).origin : '';
  var previousFocus = document.activeElement;

  function loadAxe(done) {
    if (window.axe && window.axe.run) { done(); return; }
    var s = document.createElement('script');
    s.src = base + '/axe.min.js';
    s.onload = done;
    s.onerror = function () {
      show({ error: 'Could not load the checker engine. This site may block outside scripts. Try the console method on the Fixlist page, or tell us which site it was.' });
    };
    document.head.appendChild(s);
  }

  function run() {
    window.axe.run(document, {
      runOnly: { type: 'tag', values: TAGS },
      resultTypes: ['violations', 'incomplete']
    }).then(function (r) {
      var v = r.violations.map(function (x) {
        return {
          id: x.id, impact: x.impact, help: x.help, helpUrl: x.helpUrl,
          nodes: x.nodes.length,
          examples: x.nodes.slice(0, 3).map(function (n) {
            return { target: n.target.join(' '), html: (n.html || '').slice(0, 200) };
          })
        };
      }).sort(function (a, b) {
        return (ORDER[a.impact] - ORDER[b.impact]) || (b.nodes - a.nodes);
      });
      show({ violations: v, review: r.incomplete.length, axe: r.testEngine.version });
    }).catch(function (e) {
      show({ error: 'The check failed: ' + (e && e.message ? e.message : e) });
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function show(data) {
    var host = document.createElement('div');
    host.id = 'fixlist-root';
    host.style.cssText = 'all:initial;position:fixed;top:12px;right:12px;z-index:2147483647;';
    var root = host.attachShadow({ mode: 'open' });
    var style = document.createElement('style');
    style.textContent =
      ':host{all:initial}' +
      '.panel{box-sizing:border-box;width:min(420px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:#fff;color:#14213d;' +
      'font:15px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;border:2px solid #14213d;border-radius:10px;padding:16px;box-shadow:0 8px 30px rgba(0,0,0,.3)}' +
      'h2{font-size:18px;margin:0 0 8px}h2:focus{outline:3px solid #0a58ca;outline-offset:2px}' +
      '.sum{margin:0 0 12px;font-weight:600}ol{margin:0 0 12px;padding-left:20px}li{margin-bottom:10px}' +
      '.tag{display:inline-block;font-size:12px;font-weight:700;text-transform:uppercase;padding:1px 7px;border-radius:99px;background:#14213d;color:#fff;margin-right:6px}' +
      '.tag.critical{background:#9b1c1c}.tag.serious{background:#92400e}.tag.moderate{background:#7a5b00}.tag.minor{background:#374151}' +
      '.tip{margin:4px 0 0;font-size:14px;color:#374151}.row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}' +
      'button,a.btn{font:inherit;font-weight:600;padding:8px 12px;border-radius:8px;border:2px solid #14213d;background:#fff;color:#14213d;cursor:pointer;text-decoration:none}' +
      'a.btn.primary{background:#0a58ca;border-color:#0a58ca;color:#fff}button:focus,a.btn:focus{outline:3px solid #0a58ca;outline-offset:2px}' +
      '.note{font-size:13px;color:#374151;margin:10px 0 0}';
    root.appendChild(style);
    var panel = document.createElement('div');
    panel.className = 'panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'fl-title');

    var html = '<h2 id="fl-title" tabindex="-1">Fixlist accessibility check</h2>';
    if (data.error) {
      html += '<p class="sum">' + esc(data.error) + '</p>';
    } else if (!data.violations.length) {
      html += '<p class="sum">No automated failures found on this page.</p>' +
        '<p class="note">That does not mean the page is fully accessible. Automated tools check only part of the guidelines.' +
        (data.review ? ' ' + data.review + ' item(s) need a manual look.' : '') + '</p>';
    } else {
      var els = 0, serious = 0;
      data.violations.forEach(function (x) {
        els += x.nodes;
        if (x.impact === 'critical' || x.impact === 'serious') { serious += 1; }
      });
      html += '<p class="sum">' + data.violations.length + ' issue types · ' + els + ' elements · ' + serious + ' critical or serious</p><ol>';
      data.violations.slice(0, 5).forEach(function (x) {
        var r = RULES[x.id];
        html += '<li><span class="tag ' + esc(x.impact) + '">' + esc(x.impact) + '</span>' +
          '<strong>' + esc(r ? r.label : x.help) + '</strong> (' + x.nodes + ')' +
          (r ? '<p class="tip">' + esc(r.why) + '</p>' : '') + '</li>';
      });
      html += '</ol>';
      if (data.violations.length > 5) {
        html += '<p class="note">Showing the 5 most important of ' + data.violations.length + ' issue types. Copy the results to keep the full list.</p>';
      }
    }
    html += '<div class="row">';
    if (!data.error) { html += '<button type="button" id="fl-copy">Copy results</button>'; }
    html += '<a class="btn primary" href="' + esc(base) + '/order" target="_blank" rel="noopener">Get the fix plan</a>' +
      '<button type="button" id="fl-close">Close</button></div>' +
      '<p class="note">Everything ran in your browser. Nothing was sent to Fixlist. Not legal advice and not a compliance certificate.</p>';
    panel.innerHTML = html;
    root.appendChild(panel);
    document.body.appendChild(host);

    var title = root.getElementById('fl-title');
    title.focus();

    function close() {
      host.remove();
      document.removeEventListener('keydown', onKey, true);
      if (previousFocus && previousFocus.focus) { try { previousFocus.focus(); } catch (e) { /* ignore */ } }
    }
    function onKey(e) { if (e.key === 'Escape') { close(); } }
    document.addEventListener('keydown', onKey, true);
    root.getElementById('fl-close').addEventListener('click', close);
    var copy = root.getElementById('fl-copy');
    if (copy) {
      copy.addEventListener('click', function () {
        var out = JSON.stringify({
          tool: 'fixlist', version: VERSION, url: location.href, checkedAt: new Date().toISOString(),
          axeVersion: data.axe, issueTypes: data.violations.length, violations: data.violations
        }, null, 2);
        var done = function () { copy.textContent = 'Copied'; };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(out).then(done, function () { copy.textContent = 'Copy failed'; });
        } else { copy.textContent = 'Copy not supported here'; }
      });
    }
  }

  loadAxe(run);
}());
