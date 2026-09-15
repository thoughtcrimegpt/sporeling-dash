/* Screen-sized touch text. World rendering and physics stay in the game. */
(() => {
  "use strict";
  window.createSporelingPlayOverlay = ({ action }) => {
    const root = document.createElement("section");
    root.className = "play-overlay";
    root.hidden = true;
    root.innerHTML = `<div class="play-vitals" aria-label="Game status"><span data-life></span><span data-blooms></span><span data-berries></span><span data-keepsakes></span><span data-timer></span><span data-boss></span></div>
      <article class="play-message" hidden><p class="play-message-title"></p><p class="play-message-copy"></p><button type="button" class="play-message-next">Continue</button></article>
      <div class="play-lesson" hidden><article role="dialog" aria-modal="true" aria-labelledby="play-lesson-title"><p class="play-eyebrow">NEW MOVE</p><h2 id="play-lesson-title"></h2><p class="play-lesson-copy"></p><button type="button">Got it</button></article></div>`;
    document.body.appendChild(root);
    const life = root.querySelector("[data-life]"), blooms = root.querySelector("[data-blooms]"), berries = root.querySelector("[data-berries]");
    const keepsakes = root.querySelector("[data-keepsakes]"), timer = root.querySelector("[data-timer]"), boss = root.querySelector("[data-boss]");
    const message = root.querySelector(".play-message"), title = root.querySelector(".play-message-title"), copy = root.querySelector(".play-message-copy"), next = root.querySelector(".play-message-next");
    const lesson = root.querySelector(".play-lesson"), lessonTitle = root.querySelector("h2"), lessonCopy = root.querySelector(".play-lesson-copy"), gotIt = lesson.querySelector("button");
    const put = (el, value) => { if (el.textContent !== value) el.textContent = value; };
    const setHidden = (el, value) => { if (el.hidden !== value) el.hidden = value; };
    next.addEventListener("click", () => action("talk"));
    gotIt.addEventListener("click", () => action("lesson"));
    root.addEventListener("keydown", e => {
      if (e.target.tagName === "BUTTON") e.stopPropagation();
    });
    let lessonOpen = false;
    let visible = false;
    let mirrored = false;
    let dialogue = false;
    return {
      sync(view) {
        const nextVisible = view.touch && (view.mode === "play" || view.mode === "reunion");
        if (visible !== nextVisible) { visible = nextVisible; root.hidden = !visible; }
        if (!visible) { lessonOpen = false; return; }
        const nextMirrored = !!view.leftHanded;
        if (mirrored !== nextMirrored) {
          mirrored = nextMirrored;
          root.classList.toggle("is-mirrored", mirrored);
        }
        put(life, `Health ${view.health}/${view.maxHealth}`);
        put(blooms, `Blooms ${view.spores}/3`);
        put(berries, view.reach ? "" : `Berries ${view.berries}/${view.berriesTotal}`);
        setHidden(berries, !!view.reach);
        setHidden(keepsakes, !!view.reach);
        put(keepsakes, `Keepsakes ${view.keepsakes}/4`);
        setHidden(timer, !view.timed);
        // The host formats tenths of a second; put() already limits mutations
        // to those visible changes without delaying the clock after a restart.
        if (view.timed) put(timer, view.time);
        setHidden(boss, view.bossPips == null);
        if (view.bossPips != null) put(boss, `Boss ${view.bossPips}/${view.bossMaxPips || 3}`);
        setHidden(lesson, !view.lesson);
        if (view.lesson) {
          put(lessonTitle, view.lesson.title);
          put(lessonCopy, view.lesson.lines.join(" "));
          if (!lessonOpen) gotIt.focus({ preventScroll: true });
          lessonOpen = true;
        } else lessonOpen = false;
        const content = view.lesson ? null : view.message;
        setHidden(message, !content);
        if (content) {
          put(title, content.title);
          put(copy, content.text);
          setHidden(next, !content.action);
          if (content.action) put(next, content.action);
          const nextDialogue = !!content.action;
          if (dialogue !== nextDialogue) { dialogue = nextDialogue; message.classList.toggle("is-dialogue", dialogue); }
        }
      },
    };
  };
})();
