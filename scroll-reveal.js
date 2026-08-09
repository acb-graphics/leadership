/* Scroll reveal — drop-in for the leadership site.
   Add to every page, just before </body> (after rainbow-selection.js):
     <script src="scroll-reveal.js" defer></script>

   Blocks wipe up as they enter the viewport; a few key statements
   (.thesis-lede, .intro p, the .statement lead) wipe up word by word.
   Opt an element in manually with data-reveal, out with data-no-reveal.
   Honours prefers-reduced-motion — everything is simply visible. */
(function () {
  var DUR = 0.8;                 /* seconds */
  var STAGGER = 90;              /* ms between sibling blocks */
  var WORD_STAGGER = 30;         /* ms between words */
  var EASE = 'cubic-bezier(.22,.61,.36,1)';

  /* Blocks that animate. Anything matching these is revealed on scroll. */
  var BLOCKS = [
    '.hero-art', '.hero .subtitle', '.hero h1.eyebrow',
    '.meta-block', '.chapter-head', '.arc-step', '.principle',
    '.chapter-body > div > p', '.takeaways', '.numbers .n',
    '.cv-row', '.pub-item', '.tag-list', '.statement p',
    '.cta-next', '.cta-contact'
  ].join(',');

  /* Elements revealed word by word. */
  var WORDS = ['.thesis-lede', '.intro p', '.statement p:first-child'].join(',');

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (reduce) return;

  var css = document.createElement('style');
  css.textContent =
    '[data-rv]{opacity:0; transform:translateY(0.5em); will-change:opacity,transform}' +
    '[data-rv-in]{opacity:1 !important; transform:translateY(0) !important}' +
    /* clip so descenders/ascenders don't peek above the line while sliding */
    '[data-rv-words]{clip-path:inset(-0.25em -0.5em -0.15em -0.1em)}' +
    '[data-rv-word]{display:inline-block; white-space:pre}';
  document.head.appendChild(css);

  function prep(el, delay) {
    el.setAttribute('data-rv', '');
    el.style.transition =
      'opacity ' + DUR + 's ' + EASE + ' ' + delay + 'ms,' +
      'transform ' + DUR + 's ' + EASE + ' ' + delay + 'ms';
  }

  var groups = new Map();

  /* --- word-level --- */
  Array.prototype.forEach.call(document.querySelectorAll(WORDS), function (root) {
    if (root.hasAttribute('data-no-reveal')) return;
    root.setAttribute('data-rv-words', '');

    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          if (!/\S/.test(n.nodeValue)) return;
          var frag = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.textContent = part;
            s.setAttribute('data-rv-word', '');
            frag.appendChild(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(root);

    var words = Array.prototype.slice.call(root.querySelectorAll('[data-rv-word]'));
    words.forEach(function (w, i) { prep(w, Math.min(i * WORD_STAGGER, 900)); });
    groups.set(root, words);
  });

  /* --- block-level --- */
  Array.prototype.forEach.call(document.querySelectorAll(BLOCKS + ',[data-reveal]'), function (el) {
    if (el.hasAttribute('data-no-reveal') || groups.has(el) || el.closest('[data-rv-words]')) return;
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
      return c.matches && (c.matches(BLOCKS) || c.hasAttribute('data-reveal'));
    });
    prep(el, Math.max(sibs.indexOf(el), 0) * STAGGER);
    groups.set(el, [el]);
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      (groups.get(e.target) || [e.target]).forEach(function (n) {
        n.setAttribute('data-rv-in', '');
      });
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

  groups.forEach(function (_, el) { io.observe(el); });
})();
