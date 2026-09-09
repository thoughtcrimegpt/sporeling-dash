// Small, state-free input adapter for bloom aiming and jump controls.
(function (root) {
  function create(options) {
    options = options || {};
    var canvas = options.canvas;
    var button = options.button;
    var getState = typeof options.getState === 'function' ? options.getState : function () { return {}; };
    var onStart = typeof options.onStart === 'function' ? options.onStart : function () {};
    var onAim = typeof options.onAim === 'function' ? options.onAim : function () {};
    var onRelease = typeof options.onRelease === 'function' ? options.onRelease : function () {};
    var onCancel = typeof options.onCancel === 'function' ? options.onCancel : function () {};
    var onJumpStart = typeof options.onJumpStart === 'function' ? options.onJumpStart : function () {};
    var onJumpEnd = typeof options.onJumpEnd === 'function' ? options.onJumpEnd : function () {};
    var active = null;
    var rightHeld = false;
    var destroyed = false;
    var listeners = [];

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
    function setButtonClass() {
      if (button && button.classList && typeof button.classList.add === 'function') button.classList.add('is-aiming');
    }
    function cancel() {
      if (active) {
        var old = active;
        active = null;
        clearButtonClass();
        releaseCapture(old.owner, old.id);
        onCancel();
      }
      if (rightHeld) {
        rightHeld = false;
        onJumpEnd();
      }
    }
    function beginPhone(event) {
      if (destroyed || !enabled(event) || !primary(event) || active) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      prevent(event);
      active = { owner: button, id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false, fallback: fallbackAim(event) };
      capture(button, event.pointerId);
      setButtonClass();
      var initial = fallbackAim(event);
      onStart(initial);
      onAim(initial);
    }
    function phoneMove(event) {
      if (!active || active.owner !== button || event.pointerId !== active.id) return;
      prevent(event);
      var dx = event.clientX - active.x, dy = event.clientY - active.y;
      if (Math.hypot(dx, dy) >= 10) active.dragged = true;
      if (active.dragged) onAim(vector(dx, dy, 1, 0));
    }
    function phoneRelease(event, cancelled) {
      if (!active || active.owner !== button || event.pointerId !== active.id) return;
      prevent(event);
      var old = active;
      active = null; // release capture can synchronously emit lostpointercapture
      clearButtonClass();
      releaseCapture(old.owner, old.id);
      if (cancelled || !enabled(event)) { onCancel(); return; }
      var dx = event.clientX - old.x, dy = event.clientY - old.y;
      var dragged = old.dragged || Math.hypot(dx, dy) >= 10;
      onRelease(dragged ? vector(dx, dy, 1, 0) : old.fallback);
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
    listen(button, 'click', function (event) { if (event.detail === 0 && enabled(event) && !active) { prevent(event); onRelease(fallbackAim(event)); } });
    listen(button, 'pointerdown', beginPhone);
    listen(button, 'pointermove', phoneMove);
    listen(button, 'pointerup', function (e) { phoneRelease(e, false); });
    listen(button, 'pointercancel', function (e) { phoneRelease(e, true); });
    listen(button, 'lostpointercapture', function (e) { if (active && active.owner === button && e.pointerId === active.id) phoneRelease(e, true); });
    listen(root, 'mouseup', canvasUp);
    listen(root, 'blur', cancel);
    if (root.document) listen(root.document, 'visibilitychange', function () { if (root.document.hidden) cancel(); });
    if (button && typeof button.setAttribute === 'function') button.setAttribute('aria-label', 'Aim bloom: drag and release; tap to dash');

    return { cancel: cancel, destroy: function () { if (destroyed) return; cancel(); destroyed = true; listeners.splice(0).forEach(function (remove) { remove(); }); clearButtonClass(); } };
  }
  root.SporelingBloomControls = { create: create };
})(typeof window !== 'undefined' ? window : globalThis);
