// Small, state-free input adapter for bloom aiming and jump controls.
(function (root) {
  function create(options) {
    options = options || {};
    var canvas = options.canvas;
    var button = options.button;
    var jumpButton = options.jumpButton;
    var getState = typeof options.getState === 'function' ? options.getState : function () { return {}; };
    var onStart = typeof options.onStart === 'function' ? options.onStart : function () {};
    var onAim = typeof options.onAim === 'function' ? options.onAim : function () {};
    var onAimCancel = typeof options.onAimCancel === 'function' ? options.onAimCancel : function () {};
    var onRelease = typeof options.onRelease === 'function' ? options.onRelease : function () {};
    var onCancel = typeof options.onCancel === 'function' ? options.onCancel : function () {};
    var onJumpStart = typeof options.onJumpStart === 'function' ? options.onJumpStart : function () {};
    var onJumpEnd = typeof options.onJumpEnd === 'function' ? options.onJumpEnd : function () {};
    var active = null;
    var jumpActive = null;
    var rightHeld = false;
    var destroyed = false;
    var listeners = [];
    var SWIPE_ARM = 24, SWIPE_CANCEL = 14, DASH_SWIPE_ARM = 18;
    var SECTOR_HYSTERESIS = 7 * Math.PI / 180;

    function state(event) { return getState(event) || {}; }
    function enabled(event) { return state(event).enabled !== false; }
    function finite(value) { return typeof value === 'number' && isFinite(value); }
    function vector(x, y, fallbackX, fallbackY) {
      if (!finite(x) || !finite(y) || Math.hypot(x, y) < 1e-6) {
        x = finite(fallbackX) ? fallbackX : 1;
        y = finite(fallbackY) ? fallbackY : 0;
      }
      var length = Math.hypot(x, y);
      if (!finite(length) || length < 1e-6) return { dx: 1, dy: 0 };
      return { dx: x / length, dy: y / length };
    }
    function snap8(x, y, previous) {
      if (!finite(x) || !finite(y) || Math.hypot(x, y) < 1e-6) return previous || vector(x, y, 1, 0);
      var angle = Math.atan2(y, x), sector = Math.round(angle / (Math.PI / 4));
      if (previous && finite(previous.dx) && finite(previous.dy)) {
        var old = Math.atan2(previous.dy, previous.dx);
        var delta = Math.atan2(Math.sin(angle - old), Math.cos(angle - old));
        if (Math.abs(delta) < Math.PI / 8 + SECTOR_HYSTERESIS) return previous;
      }
      var dx = Math.cos(sector * Math.PI / 4), dy = Math.sin(sector * Math.PI / 4);
      return { dx: Math.abs(dx) < 1e-6 ? 0 : dx, dy: Math.abs(dy) < 1e-6 ? 0 : dy };
    }
    function aimAt(x, y, event) {
      var s = state(event);
      var px = finite(s.playerX) ? s.playerX : 0;
      var py = finite(s.playerY) ? s.playerY : 0;
      return vector(x - px, y - py, s.aimX, s.aimY);
    }
    function fallbackAim(event) {
      var s = state(event);
      return vector(s.aimX, s.aimY, 1, 0);
    }
    function prevent(event) {
      if (event && typeof event.preventDefault === 'function') event.preventDefault();
    }
    function primary(event) {
      if (!event) return false;
      if (event.pointerType === 'touch' || event.pointerType === 'pen') return true;
      return event.isPrimary !== false && (event.button === undefined || event.button === 0 || event.button === 2);
    }
    function capture(target, id) {
      if (target && typeof target.setPointerCapture === 'function') {
        try { target.setPointerCapture(id); } catch (_) {}
      }
    }
    function releaseCapture(target, id) {
      if (target && typeof target.releasePointerCapture === 'function') {
        try { target.releasePointerCapture(id); } catch (_) {}
      }
    }
    function clearButtonClass() {
      if (button && button.classList && typeof button.classList.remove === 'function') button.classList.remove('is-aiming');
    }
    function clearJumpClass() {
      if (jumpButton && jumpButton.classList && typeof jumpButton.classList.remove === 'function') jumpButton.classList.remove('is-jumping', 'is-aiming');
    }
    function setAimStyle(target, aim) {
      if (target && target.style && typeof target.style.setProperty === 'function' && aim) target.style.setProperty('--aim-angle', Math.atan2(aim.dy, aim.dx) + 'rad');
    }
    function clearAimStyle(target) {
      if (target && target.style && typeof target.style.removeProperty === 'function') target.style.removeProperty('--aim-angle');
    }
    function aimUpdate(target, aim) { setAimStyle(target, aim); onAim(aim); }
    function setButtonClass() {
      if (button && button.classList && typeof button.classList.add === 'function') button.classList.add('is-aiming');
    }
    function cancel() {
      if (active) {
        var old = active;
        active = null;
        clearButtonClass();
        clearAimStyle(old.owner);
        onAimCancel();
        releaseCapture(old.owner, old.id);
        onCancel();
      }
      if (rightHeld) {
        rightHeld = false;
        onJumpEnd();
      }
      if (jumpActive) {
        var jump = jumpActive;
        jumpActive = null;
        clearJumpClass();
        clearAimStyle(jump.owner);
        releaseCapture(jump.owner, jump.id);
        onAimCancel();
        onCancel();
        onJumpEnd();
      }
    }
    function beginPhone(event) {
      if (destroyed || !enabled(event) || !primary(event) || active || jumpActive) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      prevent(event);
      active = { owner: button, id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false, cancelled: false, cancelNotified: false, fallback: fallbackAim(event), aim: null };
      capture(button, event.pointerId);
      setButtonClass();
      var initial = fallbackAim(event);
      onStart(initial);
      aimUpdate(active.owner, initial);
    }
    function phoneMove(event) {
      if (!active || active.owner !== button || event.pointerId !== active.id) return;
      prevent(event);
      var dx = event.clientX - active.x, dy = event.clientY - active.y;
      var distance = Math.hypot(dx, dy);
      if (distance >= DASH_SWIPE_ARM) active.dragged = true;
      if (active.dragged && distance <= SWIPE_CANCEL) { active.cancelled = true; clearButtonClass(); clearAimStyle(active.owner); if (!active.cancelNotified) { active.cancelNotified = true; onAimCancel(); } return; }
      if (active.cancelled && distance >= DASH_SWIPE_ARM) { active.cancelled = false; active.cancelNotified = false; active.aim = null; setButtonClass(); onStart(snap8(dx, dy)); }
      if (active.dragged && !active.cancelled) { active.aim = snap8(dx, dy, active.aim); aimUpdate(active.owner, active.aim); }
    }
    function phoneRelease(event, cancelled) {
      if (!active || active.owner !== button || event.pointerId !== active.id) return;
      prevent(event);
      if (!cancelled && enabled(event)) phoneMove(event);
      var old = active;
      active = null; // release capture can synchronously emit lostpointercapture
      clearButtonClass();
      clearAimStyle(old.owner);
      releaseCapture(old.owner, old.id);
      if (cancelled || !enabled(event)) { onAimCancel(); onCancel(); return; }
      var dx = event.clientX - old.x, dy = event.clientY - old.y;
      var dragged = old.dragged || Math.hypot(dx, dy) >= DASH_SWIPE_ARM;
      if (!old.cancelled) onRelease(dragged ? snap8(dx, dy, old.aim) : old.fallback);
      else if (!old.cancelNotified) onAimCancel();
    }
    function beginJump(event) {
      if (destroyed || !enabled(event) || !primary(event) || !jumpButton || jumpActive || active) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      prevent(event);
      jumpActive = { owner: jumpButton, id: event.pointerId, x: event.clientX, y: event.clientY, armed: false, cancelled: false, cancelNotified: false, aim: null };
      capture(jumpButton, event.pointerId);
      jumpButton.classList && jumpButton.classList.add('is-jumping');
      onJumpStart();
    }
    function jumpMove(event) {
      if (!jumpActive || event.pointerId !== jumpActive.id) return;
      prevent(event);
      var dx = event.clientX - jumpActive.x, dy = event.clientY - jumpActive.y;
      var distance = Math.hypot(dx, dy);
      if (!jumpActive.armed && distance >= SWIPE_ARM) {
        jumpActive.armed = true;
        jumpActive.cancelled = false;
        jumpActive.cancelNotified = false;
        jumpActive.aim = snap8(dx, dy);
        jumpButton.classList && jumpButton.classList.add('is-aiming');
        onStart(jumpActive.aim);
      } else if (jumpActive.armed && distance <= SWIPE_CANCEL) {
        jumpActive.armed = false;
        jumpActive.cancelled = true;
        jumpButton.classList && jumpButton.classList.remove('is-aiming');
        clearAimStyle(jumpActive.owner); if (!jumpActive.cancelNotified) { jumpActive.cancelNotified = true; onAimCancel(); }
      }
      if (jumpActive.armed) { jumpActive.aim = snap8(dx, dy, jumpActive.aim); aimUpdate(jumpActive.owner, jumpActive.aim); }
    }
    function endJump(event, cancelled) {
      if (!jumpActive || event.pointerId !== jumpActive.id) return;
      prevent(event);
      if (!cancelled && enabled(event)) jumpMove(event);
      var old = jumpActive;
      jumpActive = null;
      clearJumpClass(); clearAimStyle(old.owner);
      releaseCapture(old.owner, old.id);
      if (old.armed && !old.cancelled && !cancelled && enabled(event)) onRelease(old.aim || snap8(event.clientX - old.x, event.clientY - old.y));
      else if (!old.cancelNotified) onAimCancel();
      if (cancelled || !enabled(event)) onCancel();
      onJumpEnd();
    }
    function canvasDown(event) {
      if (destroyed || !enabled(event) || !primary(event)) return;
      prevent(event);
      if (event.button === 2) {
        if (!rightHeld) { rightHeld = true; capture(canvas, event.pointerId); onJumpStart(); }
        return;
      }
      if (active) return;
      var direction = aimAt(event.clientX, event.clientY, event);
      onRelease(direction);
    }
    function canvasMove(event) {
      if (destroyed || !enabled(event) || event.pointerType !== 'mouse') return;
      if (!active && (event.buttons === undefined || (event.buttons & 1) === 0)) { var aim=aimAt(event.clientX,event.clientY,event); aim.clientX=event.clientX; aim.clientY=event.clientY; onAim(aim); }
    }
    function canvasMouseDown(event) { canvasDown(event); }
    function canvasUp(event) {
      if (event.button !== 2 || !rightHeld) return;
      prevent(event);
      rightHeld = false;
      releaseCapture(canvas, event.pointerId);
      onJumpEnd();
    }
    function canvasCancel(event) {
      if (!rightHeld) return;
      rightHeld = false;
      releaseCapture(canvas, event.pointerId);
      onJumpEnd();
    }
    function canvasMouseMove(event) {
      if (destroyed || !enabled(event)) return;
      if (!active && (event.buttons === undefined || (event.buttons & 1) === 0)) { var aim=aimAt(event.clientX,event.clientY,event); aim.clientX=event.clientX; aim.clientY=event.clientY; onAim(aim); }
    }
    function contextMenu(event) { if (enabled(event)) prevent(event); }
    function listen(target, type, handler) {
      if (!target || typeof target.addEventListener !== 'function') return;
      target.addEventListener(type, handler, { passive: false });
      listeners.push(function () { target.removeEventListener(type, handler, { passive: false }); });
    }
    listen(canvas, 'mousedown', canvasMouseDown);
    listen(canvas, 'pointermove', canvasMove);
    listen(canvas, 'mousemove', canvasMouseMove);
    listen(canvas, 'pointercancel', canvasCancel);
    listen(canvas, 'contextmenu', contextMenu);
    listen(button, 'click', function (event) { if (event.detail === 0 && enabled(event) && !active && !jumpActive) { prevent(event); onRelease(fallbackAim(event)); } });
    listen(button, 'pointerdown', beginPhone);
    listen(button, 'pointermove', phoneMove);
    listen(button, 'pointerup', function (e) { phoneMove(e); phoneRelease(e, false); });
    listen(button, 'pointercancel', function (e) { phoneRelease(e, true); });
    listen(button, 'lostpointercapture', function (e) { if (active && active.owner === button && e.pointerId === active.id) phoneRelease(e, true); });
    listen(jumpButton, 'pointerdown', beginJump);
    listen(jumpButton, 'pointermove', jumpMove);
    listen(jumpButton, 'pointerup', function (e) { jumpMove(e); endJump(e, false); });
    listen(jumpButton, 'pointercancel', function (e) { endJump(e, true); });
    listen(jumpButton, 'lostpointercapture', function (e) { endJump(e, true); });
    listen(jumpButton, 'click', function (event) { if (event.detail === 0 && enabled(event) && !active && !jumpActive) { prevent(event); onJumpStart(); onJumpEnd(); } });
    listen(root, 'mouseup', canvasUp);
    listen(root, 'blur', cancel);
    if (root.document) listen(root.document, 'visibilitychange', function () { if (root.document.hidden) cancel(); });
    if (button && typeof button.setAttribute === 'function') button.setAttribute('aria-label', 'Aim bloom: drag and release; tap to dash');

    return { cancel: cancel, destroy: function () { if (destroyed) return; cancel(); destroyed = true; listeners.splice(0).forEach(function (remove) { remove(); }); clearButtonClass(); clearJumpClass(); } };
  }
  root.SporelingBloomControls = { create: create };
})(typeof window !== 'undefined' ? window : globalThis);
