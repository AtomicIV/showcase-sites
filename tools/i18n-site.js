/* Showcase bilingual runtime (VI ⇄ EN)
 * - Per-site translation map: window.__SITE_EN (sites/<slug>/i18n.en.js), exact strings + {0} templates
 * - Optional shared fallback: window.__AGY_I18N_DICT.exact
 * - Reversible: swaps text nodes / attributes in place (no DOM rebuild), so GSAP, listeners & state survive
 * - Live: a MutationObserver translates content rendered later by the page's own JS while EN is active
 * - Vietnamese stays the default; EN only via ?lang=en or the VI/EN pill
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (location.search.indexOf('static') !== -1) return;

  var VI_RE = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, PRE: 1, SVG: 0 };
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt', 'data-tip', 'data-label'];

  var map = Object.create(null);
  var templates = [];
  var ready = false;

  function norm(s) {
    return String(s).replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function prepare() {
    if (ready) return;
    ready = true;
    var site = window.__SITE_EN || {};
    var common = (window.__AGY_I18N_DICT && window.__AGY_I18N_DICT.exact) || {};
    var k;
    for (k in common) map[norm(k)] = common[k];
    for (k in site) map[norm(k)] = site[k];
    for (k in map) {
      if (/\{\d+\}/.test(k)) {
        var order = [];
        var src = '^' + esc(k).replace(/\\\{(\d+)\\\}/g, function (_, d) {
          order.push(+d);
          return '([\\s\\S]+?)';
        }) + '$';
        try {
          templates.push({ re: new RegExp(src), order: order, en: map[k], lit: k.replace(/\{\d+\}/g, '').length });
        } catch (e) {}
      }
    }
    // prefer the most specific templates first
    templates.sort(function (a, b) {
      return b.lit - a.lit;
    });
  }

  function lookup(t, depth) {
    var v = map[t];
    if (v != null) return v;
    depth = depth || 0;
    if (templates.length && depth < 3) {
      outer: for (var i = 0; i < templates.length; i++) {
        var T = templates[i];
        var m = T.re.exec(t);
        if (!m) continue;
        var vals = {};
        for (var j = 0; j < T.order.length; j++) {
          var x = m[j + 1];
          if (VI_RE.test(x)) {
            // a placeholder may only swallow names/numbers or text we can translate on its own
            var tx = map[norm(x)];
            if (tx == null) tx = translateCore(norm(x), depth + 1);
            if (tx == null) {
              if (!isNameLike(x)) continue outer;
              tx = x;
            }
            x = tx;
          }
          vals[T.order[j]] = x;
        }
        return T.en.replace(/\{(\d+)\}/g, function (_, d) {
          return vals[d] != null ? vals[d] : '';
        });
      }
    }
    return null;
  }

  function translate(raw) {
    if (!raw || !VI_RE.test(raw)) return null;
    var lead = raw.match(/^\s*/)[0];
    var trail = raw.match(/\s*$/)[0];
    var t = norm(raw);
    var v = translateCore(t, 0);
    return v == null ? null : lead + v + trail;
  }

  // Generic patterns for strings that pages assemble at runtime (counters, relative time, dates)
  var GENERIC = {
    'Còn {0} ngày': '{0} days left', 'Còn {0} giờ': '{0} hours left', 'Còn {0} phút': '{0} min left', 'Còn {0} giây': '{0} s left', 'Còn {0} tuần': '{0} weeks left', 'Còn {0} tháng': '{0} months left',
    'Còn {0}': '{0} left', 'Còn lại {0}': '{0} remaining',
    '{0} ngày trước': '{0} days ago', '{0} giờ trước': '{0} hours ago', '{0} phút trước': '{0} min ago', '{0} giây trước': '{0} s ago', '{0} tuần trước': '{0} weeks ago', '{0} tháng trước': '{0} months ago', '{0} năm trước': '{0} years ago',
    'Sau {0} ngày': 'In {0} days', 'Trong {0} ngày': 'Within {0} days',
    'Quá hạn {0} ngày': '{0} days overdue', 'Trễ {0} ngày': '{0} days late', 'Trễ {0} phút': '{0} min late',
    '{0} ngày': '{0} days', '{0} giờ': '{0} hours', '{0} phút': '{0} min', '{0} giây': '{0} s', '{0} tuần': '{0} weeks', '{0} tháng': '{0} months', '{0} năm': '{0} years',
    '{0} người': '{0} people', '{0} khách': '{0} guests', '{0} đơn': '{0} orders', '{0} đơn hàng': '{0} orders', '{0} sản phẩm': '{0} products', '{0} hồ sơ': '{0} files', '{0} lượt': '{0} times',
    '{0} phòng': '{0} rooms', '{0} bàn': '{0} tables', '{0} món': '{0} items', '{0} mục': '{0} items', '{0} việc': '{0} tasks', '{0} ca': '{0} cases', '{0} lô': '{0} batches', '{0} xe': '{0} vehicles',
    '{0} bệnh nhân': '{0} patients', '{0} học viên': '{0} students', '{0} nhân viên': '{0} staff', '{0} thành viên': '{0} members', '{0} chi nhánh': '{0} branches', '{0} kết quả': '{0} results',
    '{0} đánh giá': '{0} reviews', '{0} bình luận': '{0} comments', '{0} lượt xem': '{0} views', '{0} chỗ': '{0} seats', '{0} vé': '{0} tickets', '{0} tầng': '{0} floors', '{0} sao': '{0} stars',
    '{0} triệu': '{0} million', '{0} tỷ': '{0} billion', '{0} nghìn': '{0} thousand', '{0} triệu đồng': '{0} million VND', '{0} đồng': '{0} VND',
    'Tháng {0}': 'Month {0}', 'Tuần {0}': 'Week {0}', 'Ngày {0}': 'Day {0}', 'Quý {0}': 'Q{0}', 'Năm {0}': 'Year {0}', 'Bước {0}': 'Step {0}', 'Tầng {0}': 'Floor {0}', 'Phòng {0}': 'Room {0}', 'Bàn {0}': 'Table {0}', 'Ca {0}': 'Shift {0}',
    'Hạn ngày mai': 'Due tomorrow', 'Hạn hôm nay': 'Due today', 'Quá hạn': 'Overdue', 'Ngày mai': 'Tomorrow', 'Hôm nay': 'Today', 'Hôm qua': 'Yesterday', 'Vừa xong': 'Just now', 'vừa xong': 'just now',
    'Chủ nhật': 'Sunday', 'Thứ Hai': 'Monday', 'Thứ Ba': 'Tuesday', 'Thứ Tư': 'Wednesday', 'Thứ Năm': 'Thursday', 'Thứ Sáu': 'Friday', 'Thứ Bảy': 'Saturday',
    'Thứ hai': 'Monday', 'Thứ ba': 'Tuesday', 'Thứ tư': 'Wednesday', 'Thứ năm': 'Thursday', 'Thứ sáu': 'Friday', 'Thứ bảy': 'Saturday', 'Chủ Nhật': 'Sunday',
    'Chào buổi sáng': 'Good morning', 'Chào buổi chiều': 'Good afternoon', 'Chào buổi tối': 'Good evening', 'Xin chào': 'Hello',
    'Còn {0}g {1}p': '{0}h {1}m left', '{0}g {1}p': '{0}h {1}m', 'Còn {0}h {1} phút': '{0}h {1} min left', 'Còn {0} giờ {1} phút': '{0} h {1} min left', '{0} giờ {1} phút': '{0} h {1} min',
    'Chờ duyệt': 'Pending approval', 'Đã duyệt': 'Approved', 'Từ chối': 'Rejected', 'Đang xử lý': 'Processing', 'Hoàn thành': 'Completed', 'Đã hủy': 'Cancelled', 'Đang chạy': 'Running', 'Tạm dừng': 'Paused', 'Đang mở cửa': 'Open now', 'Đã đóng cửa': 'Closed',
    'Sáng': 'Morning', 'Chiều': 'Afternoon', 'Tối': 'Evening', 'Đêm': 'Night', 'Ca sáng': 'Morning shift', 'Ca chiều': 'Afternoon shift', 'Ca tối': 'Evening shift', 'Ca đêm': 'Night shift',
  };
  var NUM_RE = /\d+(?:[.,:\/]\d+)*(?:%|k|K|tr)?/g;
  var SEP_RE = /( · | — | – | \| | • | → | ⇢ |: |, | - )/;

  function numericLookup(t) {
    var nums = t.match(NUM_RE);
    if (!nums) return null;
    var key = t.replace(NUM_RE, '{0}');
    // number every placeholder: {0} {1} ...
    var i = 0;
    var keyN = key.replace(/\{0\}/g, function () {
      return '{' + i++ + '}';
    });
    var tpl = map[keyN];
    if (tpl == null) tpl = GENERIC[keyN];
    if (tpl == null) {
      var cap = keyN.charAt(0).toUpperCase() + keyN.slice(1);
      if (cap !== keyN && GENERIC[cap] != null) tpl = GENERIC[cap].charAt(0).toLowerCase() + GENERIC[cap].slice(1);
    }
    if (tpl == null && nums.length === 1) tpl = map[key] != null ? map[key] : GENERIC[key];
    if (tpl == null) return null;
    return tpl.replace(/\{(\d+)\}/g, function (_, d) {
      return nums[+d] != null ? nums[+d] : '';
    });
  }

  // "Bùi Mỹ Châu", "Nội tổng quát (P.101)"-style leftovers: a proper name keeps every word capitalised
  function isNameLike(s) {
    var w = norm(s).replace(/\(.*?\)/g, '').split(' ').filter(Boolean);
    if (!w.length || w.length > 5) return false;
    for (var i = 0; i < w.length; i++) {
      var c = w[i].charAt(0);
      if (/\d/.test(c)) continue;
      if (c === c.toLowerCase() || c !== c.toUpperCase()) return false;
    }
    return true;
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function translateCore(t, depth) {
    var v = map[t];
    if (v != null) return v;
    var dm = t.match(/^(\d{1,2}) tháng (\d{1,2})(?:,? (\d{4}))?$/i);
    if (dm && +dm[2] >= 1 && +dm[2] <= 12) return MONTHS[+dm[2] - 1] + ' ' + (+dm[1]) + (dm[3] ? ', ' + dm[3] : '');
    var mm = t.match(/^[Tt]háng (\d{1,2})(?:[\/,] ?(\d{4}))?$/);
    if (mm && +mm[1] >= 1 && +mm[1] <= 12) return MONTHS[+mm[1] - 1] + (mm[2] ? ' ' + mm[2] : '');
    v = numericLookup(t);
    if (v != null) return v;
    v = lookup(t, depth);
    if (v != null) return v;
    // trailing / leading record codes: 'Chờ duyệt XD-0193', '#20 Phiên'
    var cm = t.match(/^(.*?\S)\s+((?:[A-Z]{1,5}[-.]?)?\d[\w.\-\/]*|#\d+)$/);
    if (cm && depth < 2 && VI_RE.test(cm[1])) {
      var cp = translateCore(cm[1], depth + 1);
      if (cp != null) return cp + ' ' + cm[2];
    }
    if (GENERIC[t] != null) return GENERIC[t];
    var capT = t.charAt(0).toUpperCase() + t.slice(1);
    if (capT !== t && GENERIC[capT] != null) return GENERIC[capT].charAt(0).toLowerCase() + GENERIC[capT].slice(1);
    // decorative prefixes/suffixes (bullets, arrows, colons, counters)
    var m = t.match(/^([•·—–\-→←↗✓✔★✦◆▸\/|#№\d.,:()\s]*)(.*?)([\s:*→←↗↓↑.…!?)]*)$/);
    if (m && m[2] && m[2] !== t) {
      var mid = lookup(m[2], depth + 1);
      if (mid == null) mid = GENERIC[m[2]] != null ? GENERIC[m[2]] : numericLookup(m[2]);
      if (mid != null) return m[1] + mid + m[3];
    }
    // composite strings built at runtime: "Name · Status", "15:08 · Chủ nhật 01/11"
    if (depth < 2 && SEP_RE.test(t)) {
      var parts = t.split(SEP_RE);
      var any = false;
      var ok = true;
      for (var i = 0; i < parts.length; i += 2) {
        if (!VI_RE.test(parts[i])) continue;
        var tp = translateCore(parts[i].trim(), depth + 1);
        if (tp != null) {
          parts[i] = tp;
          any = true;
        } else if (!isNameLike(parts[i])) ok = false;
      }
      if (any && ok) return parts.join('');
    }
    // weekday + date, e.g. "Chủ nhật 01/11"
    var wd = t.match(/^(Chủ [Nn]hật|Thứ [Hh]ai|Thứ [Bb]a|Thứ [Tt]ư|Thứ [Nn]ăm|Thứ [Ss]áu|Thứ [Bb]ảy)(\s.*)$/);
    if (wd) return GENERIC[wd[1].replace(/^(\S+) (\S)/, function (_, a, b) { return a + ' ' + b.toUpperCase(); })] + wd[2];
    return null;
  }

  // ------------------------------------------------------------------ state
  var lang = 'vi';
  var textNodes = new Set();
  var attrRecs = [];
  var bar = null;
  var observer = null;
  var applying = false;

  function skipEl(el) {
    for (var e = el; e && e !== document.body; e = e.parentElement) {
      if (SKIP[e.tagName]) return true;
      if (e === bar) return true;
      if (e.isContentEditable) return true;
      if (e.hasAttribute && e.hasAttribute('data-no-i18n')) return true;
    }
    return false;
  }

  function applyText(n) {
    if (!n.parentElement || skipEl(n.parentElement)) return;
    var cur = n.nodeValue;
    if (n.__en != null && cur === n.__en) return; // already ours
    var en = translate(cur);
    if (en == null) return;
    n.__vi = cur;
    n.__en = en;
    n.nodeValue = en;
    textNodes.add(n);
  }

  function applyAttrs(el) {
    if (skipEl(el)) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i];
      if (!el.hasAttribute(a)) continue;
      var cur = el.getAttribute(a);
      var key = '__en_' + a;
      if (el[key] != null && el[key] === cur) continue;
      var en = translate(cur);
      if (en == null) continue;
      el['__vi_' + a] = cur;
      el[key] = en;
      el.setAttribute(a, en);
      attrRecs.push(el);
    }
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type) && VI_RE.test(el.value)) {
      var ev = translate(el.value);
      if (ev != null) {
        el.__vi_value = el.value;
        el.__en_value = ev;
        el.value = ev;
        attrRecs.push(el);
      }
    }
  }

  function walk(root) {
    if (root.nodeType === 3) return applyText(root);
    if (root.nodeType !== 1 || root === bar) return;
    if (skipEl(root)) return;
    applyAttrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) applyText(n);
      else applyAttrs(n);
    }
  }

  function startObserver() {
    if (observer || !window.MutationObserver) return;
    observer = new MutationObserver(function (records) {
      if (applying || lang !== 'en') return;
      applying = true;
      try {
        for (var i = 0; i < records.length; i++) {
          var r = records[i];
          if (r.type === 'childList') {
            for (var j = 0; j < r.addedNodes.length; j++) walk(r.addedNodes[j]);
          } else if (r.type === 'characterData') {
            applyText(r.target);
          } else if (r.type === 'attributes') {
            applyAttrs(r.target);
          }
        }
      } finally {
        applying = false;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function stopObserver() {
    if (observer) observer.disconnect();
    observer = null;
  }

  function toEN() {
    prepare();
    applying = true;
    if (document.__viTitle == null) document.__viTitle = document.title;
    var tt = translate(document.__viTitle);
    if (tt) document.title = tt;
    walk(document.body);
    applying = false;
    startObserver();
  }

  function toVI() {
    stopObserver();
    applying = true;
    textNodes.forEach(function (n) {
      if (!n.isConnected) {
        textNodes.delete(n);
        return;
      }
      if (n.nodeValue === n.__en) n.nodeValue = n.__vi;
      n.__en = null;
    });
    for (var i = 0; i < attrRecs.length; i++) {
      var el = attrRecs[i];
      for (var k = 0; k < ATTRS.length; k++) {
        var a = ATTRS[k];
        if (el['__en_' + a] != null && el.getAttribute(a) === el['__en_' + a]) el.setAttribute(a, el['__vi_' + a]);
        el['__en_' + a] = null;
      }
      if (el.__en_value != null && el.value === el.__en_value) el.value = el.__vi_value;
      el.__en_value = null;
    }
    attrRecs = [];
    if (document.__viTitle != null) document.title = document.__viTitle;
    applying = false;
  }

  function setSiteLang(next) {
    next = next === 'en' ? 'en' : 'vi';
    if (next === lang) return refreshBar();
    lang = next;
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('showcase_lang', lang);
    } catch (e) {}
    if (lang === 'en') toEN();
    else toVI();
    refreshBar();
    try {
      window.dispatchEvent(new CustomEvent('showcase:lang', { detail: lang }));
    } catch (e) {}
  }

  function refreshBar() {
    if (!bar) return;
    var back = bar.querySelector('#agy-i18n-back');
    back.setAttribute('href', lang === 'en' ? '../../index.html?lang=en' : '../../index.html');
    back.textContent = lang === 'en' ? '← Catalog' : '← Danh mục';
    var spans = bar.querySelectorAll('[data-l]');
    for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', spans[i].getAttribute('data-l') === lang);
  }

  function mount() {
    if (document.getElementById('agy-i18n-bar')) return;
    var style = document.createElement('style');
    style.textContent =
      '.agy-i18n-bar{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:inline-flex;align-items:center;gap:4px;padding:4px;border-radius:999px;background:rgba(11,11,12,.92);border:1px solid rgba(244,241,234,.22);box-shadow:0 10px 30px rgba(0,0,0,.4);font:600 11px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.04em;color:#f4f1ea;backdrop-filter:blur(8px)}' +
      '.agy-i18n-back{display:inline-flex;align-items:center;justify-content:center;min-height:30px;padding:0 12px;border-radius:999px;background:#18181b;color:#f4f1ea!important;text-decoration:none!important;white-space:nowrap}' +
      '.agy-i18n-back:hover{background:#27272a}' +
      '.agy-i18n-btn{display:inline-flex;align-items:center;gap:3px;min-height:30px;padding:0 6px;border-radius:999px;border:0;background:#18181b;color:#f4f1ea;font:inherit;cursor:pointer}' +
      '.agy-i18n-btn span{padding:5px 7px;border-radius:999px;color:#d4d4d8;transition:background .2s,color .2s}' +
      '.agy-i18n-btn span.on{background:#f2ff5e;color:#0b0b0c}' +
      '.agy-i18n-btn i{font-style:normal;color:#a1a1aa}' +
      '@media print{.agy-i18n-bar{display:none}}';
    document.head.appendChild(style);
    bar = document.createElement('div');
    bar.className = 'agy-i18n-bar';
    bar.id = 'agy-i18n-bar';
    bar.setAttribute('data-no-i18n', '');
    bar.innerHTML =
      '<a class="agy-i18n-back" id="agy-i18n-back" href="../../index.html" aria-label="Quay lại danh mục / Back to catalog">← Danh mục</a>' +
      '<button type="button" class="agy-i18n-btn" id="agy-lang-btn" aria-label="Đổi ngôn ngữ Việt / Anh — Switch language VI / EN"><span data-l="vi" class="on">VI</span><i>/</i><span data-l="en">EN</span></button>';
    document.body.appendChild(bar);
    bar.querySelector('#agy-lang-btn').addEventListener('click', function (e) {
      if (e && e.isTrusted === false && !window.__allowSynthLangToggle) return;
      setSiteLang(lang === 'vi' ? 'en' : 'vi');
    });
    var q = null;
    try {
      q = new URLSearchParams(location.search).get('lang');
    } catch (e) {}
    if (q === 'en') setSiteLang('en');
  }

  window.__setSiteLang = setSiteLang;
  // Robustness: pinned GSAP sections keep their old pin-spacer width after an orientation /
  // window-width change on touch devices (ignoreMobileResize). Force a refresh on width changes.
  (function () {
    var lastKey = window.innerWidth + 'x' + window.outerWidth;
    var t = 0;
    function refreshPin() {
      try {
        var vw = document.documentElement.clientWidth || window.innerWidth;
        var spacers = document.querySelectorAll('.pin-spacer');
        for (var i = 0; i < spacers.length; i++) {
          var sp = spacers[i];
          if (sp.offsetWidth > vw) {
            sp.style.width = vw + 'px';
            sp.style.maxWidth = vw + 'px';
            if (sp.firstElementChild) {
              sp.firstElementChild.style.width = vw + 'px';
              sp.firstElementChild.style.maxWidth = vw + 'px';
            }
          }
        }
        if (window.ScrollTrigger && window.ScrollTrigger.refresh) window.ScrollTrigger.refresh();
      } catch (e) {}
    }
    function onResize() {
      var key = window.innerWidth + 'x' + window.outerWidth;
      if (key === lastKey) return;
      lastKey = key;
      refreshPin();
      clearTimeout(t);
      t = setTimeout(refreshPin, 60);
    }
    window.addEventListener('resize', onResize);
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
  })();
  window.__showcaseTranslate = function (s) {
    prepare();
    return translate(s);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
