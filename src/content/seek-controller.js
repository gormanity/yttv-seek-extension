/**
 * seek-controller.js — Content script for YTTV Seek Extension.
 *
 * Self-contained IIFE. Logic is inlined from seek-logic.js so there is no
 * dynamic import that could fail silently and leave no event listener attached.
 * seek-logic.js is kept as the ES-module source of truth for unit tests.
 */
(function () {
  // ── Defaults ──────────────────────────────────────────────────────────────
  var DEFAULT_SETTINGS = {
    seekAmount: 5,
    backKey:    'Shift+J',
    forwardKey: 'Shift+L',
  };

  // ── Key matching (mirrors seek-logic.js) ─────────────────────────────────

  function parseKey(keyString) {
    var parts = keyString.split('+');
    var mods  = { shift: false, ctrl: false, alt: false, meta: false };
    for (var i = 0; i < parts.length - 1; i++) {
      switch (parts[i].toLowerCase()) {
        case 'shift':                   mods.shift = true; break;
        case 'ctrl': case 'control':    mods.ctrl  = true; break;
        case 'alt':                     mods.alt   = true; break;
        case 'meta': case 'cmd':
        case 'command':                 mods.meta  = true; break;
      }
    }
    var key = parts[parts.length - 1];
    if (mods.shift && key.length === 1 && /[a-z]/i.test(key)) {
      key = key.toUpperCase();
    }
    return { key: key, shift: mods.shift, ctrl: mods.ctrl, alt: mods.alt, meta: mods.meta };
  }

  function matchesKey(event, keyString) {
    var parsed = parseKey(keyString);
    return (
      event.key      === parsed.key   &&
      !!event.shiftKey === parsed.shift &&
      !!event.ctrlKey  === parsed.ctrl  &&
      !!event.altKey   === parsed.alt   &&
      !!event.metaKey  === parsed.meta
    );
  }

  function applySeek(video, seconds) {
    video.currentTime = Math.max(0, video.currentTime + seconds);
  }

  function formatSeekLabel(seconds) {
    var n = Math.abs(seconds);
    return n + 's';
  }

  // ── OSD (on-screen display) ───────────────────────────────────────────────

  var OSD_HIDE_DELAY_MS = 700;

  function createOsdEl(direction) {
    var el = document.createElement('div');
    el.className = 'yttv-seek-osd yttv-seek-osd--' + direction;
    el.innerHTML =
      '<div class="yttv-seek-osd__icon">' + (direction === 'back' ? '◀◀' : '▶▶') + '</div>' +
      '<div class="yttv-seek-osd__label"></div>';
    document.body.appendChild(el);
    return el;
  }

  var osdBack    = null;
  var osdForward = null;
  var osdTimer   = null;

  function showOsd(direction, seconds) {
    // Lazily create elements so we don't touch the DOM until first use.
    if (!osdBack)    osdBack    = createOsdEl('back');
    if (!osdForward) osdForward = createOsdEl('forward');

    var active   = direction === 'back' ? osdBack : osdForward;
    var inactive = direction === 'back' ? osdForward : osdBack;

    active.querySelector('.yttv-seek-osd__label').textContent = formatSeekLabel(seconds);
    inactive.classList.remove('yttv-seek-osd--visible');

    // Remove, force reflow, re-add — restarts the fade-in transition on every press.
    active.classList.remove('yttv-seek-osd--visible');
    void active.offsetWidth;
    active.classList.add('yttv-seek-osd--visible');

    clearTimeout(osdTimer);
    osdTimer = setTimeout(function () {
      active.classList.remove('yttv-seek-osd--visible');
    }, OSD_HIDE_DELAY_MS);
  }

  // ── Storage shim ──────────────────────────────────────────────────────────
  var storageSync = (typeof browser !== 'undefined' ? browser : chrome).storage.sync;

  // ── Live settings (updated without page reload) ───────────────────────────
  var settings = Object.assign({}, DEFAULT_SETTINGS);

  storageSync.get(DEFAULT_SETTINGS, function (stored) {
    Object.assign(settings, stored);
  });

  // ── Key handler ───────────────────────────────────────────────────────────
  document.addEventListener('keydown', function (event) {
    // Ignore keypresses inside text inputs.
    var el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
      return;
    }

    var isBack    = matchesKey(event, settings.backKey);
    var isForward = matchesKey(event, settings.forwardKey);
    if (!isBack && !isForward) return;

    // Pick the best candidate: playing > ready-with-duration > first
    var videos = Array.from(document.querySelectorAll('video'));
    var video = videos.find(function(v) { return !v.paused && v.readyState >= 2; })
             || videos.find(function(v) { return v.readyState >= 2 && v.duration > 0; })
             || videos[0];

    if (!video) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    var direction = isForward ? 'forward' : 'back';
    applySeek(video, isForward ? settings.seekAmount : -settings.seekAmount);
    showOsd(direction, settings.seekAmount);
  }, /* capture */ true);

  // ── Settings live-reload ──────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg && msg.type === 'settings-updated') {
      Object.assign(settings, msg.settings);
    }
  });
}());
