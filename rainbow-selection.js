/* Rainbow text selection — drop-in.
   Add to every page, just before </body>:
     <script src="rainbow-selection.js" defer></script>

   Wraps each word in a span carrying its own hue, so a highlight paints a
   rainbow; the spectrum rotates while the selection is held.
   Opt out of a subtree with data-no-rainbow. */
(function () {
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|INPUT|SELECT|CODE|PRE|SVG)$/;

  var css = document.createElement('style');
  css.textContent =
    '::selection{background:#141414;color:#fff}' +
    '[data-rb]::selection{background:oklch(var(--rb-l,0.67) var(--rb-c,0.23)' +
    ' calc(var(--h,0) * 1deg + var(--ho,0deg)));color:#fff}';
  document.head.appendChild(css);

  var i = 0;
  function hue(el) {
    el.setAttribute('data-rb', '');
    el.style.setProperty('--h', String((i++ * 23) % 360));
  }

  function wrap(node) {
    var text = node.nodeValue;
    if (!/\S/.test(text)) return;
    var parent = node.parentNode;

    /* A leaf element holding a single word already is the container the hue
       needs — tint it directly rather than nesting another span inside it. */
    if (parent !== document.body && parent.childNodes.length === 1 &&
        !/\s/.test(text.trim())) {
      hue(parent);
      return;
    }

    var frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      var s = document.createElement('span');
      s.textContent = part;
      hue(s);
      frag.appendChild(s);
    });
    parent.replaceChild(frag, node);
  }

  function walk(el) {
    if (SKIP.test(el.tagName) || el.hasAttribute('data-no-rainbow') || el.hasAttribute('data-rb')) return;
    var kids = Array.prototype.slice.call(el.childNodes);
    for (var k = 0; k < kids.length; k++) {
      var n = kids[k];
      if (n.nodeType === 3) wrap(n);
      else if (n.nodeType === 1) walk(n);
    }
  }

  walk(document.body);

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var offset = 0;
  (function tick() {
    var sel = document.getSelection();
    if (sel && !sel.isCollapsed && !reduce) {
      offset = (offset + 1.6) % 360;
      document.documentElement.style.setProperty('--ho', offset.toFixed(1) + 'deg');
    }
    requestAnimationFrame(tick);
  })();
})();
