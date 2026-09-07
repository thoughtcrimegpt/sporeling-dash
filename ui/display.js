/* Browser display controls shared by the native menu and the game shell. */
(function () {
  "use strict";

  var message = "";
  var listenersBound = false;
  var root = function () { return document.documentElement; };
  var request = function () {
    var el = root();
    return el && (el.requestFullscreen || el.webkitRequestFullscreen);
  };
  var exit = function () { return document.exitFullscreen || document.webkitExitFullscreen; };
  var activeElement = function () { return document.fullscreenElement || document.webkitFullscreenElement || null; };
  var dispatchResize = function () {
    try {
      window.dispatchEvent(new Event("resize"));
    } catch (err) {
      try {
        var event = document.createEvent("Event");
        event.initEvent("resize", false, false);
        window.dispatchEvent(event);
      } catch (ignored) {}
    }
  };
  var update = function () { dispatchResize(); };
  var clearMessage = function () { message = ""; };
  var setError = function () {
    message = "Fullscreen could not be enabled by this browser. Use the browser's fullscreen control instead.";
    dispatchResize();
  };
  var onKeyDown = function (event) {
    var target = event.target;
    var tag = target && target.tagName ? String(target.tagName).toLowerCase() : "";
    if (event.key !== "f" && event.key !== "F" || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || tag === "input" || tag === "textarea" || tag === "select" || (target && target.isContentEditable)) return;
    event.preventDefault();
    window.SporelingDisplay.toggle();
  };

  if (!listenersBound && typeof document !== "undefined") {
    listenersBound = true;
    document.addEventListener("fullscreenchange", update);
    document.addEventListener("webkitfullscreenchange", update);
    document.addEventListener("fullscreenerror", setError);
    document.addEventListener("webkitfullscreenerror", setError);
    document.addEventListener("keydown", onKeyDown);
  }

  window.SporelingDisplay = {
    get supported() { return !!(request() && exit()); },
    get active() { return !!activeElement(); },
    get message() { return message; },
    toggle: async function () {
      var method;
      try {
        if (!this.supported) {
          message = "Fullscreen is unavailable in this browser. Use the browser's fullscreen control instead.";
          dispatchResize();
          return false;
        }
        clearMessage();
        if (activeElement()) {
          method = exit();
          await method.call(document);
        } else {
          method = request();
          await method.call(root());
        }
        dispatchResize();
        return true;
      } catch (err) {
        setError();
        return false;
      }
    }
  };
})();
