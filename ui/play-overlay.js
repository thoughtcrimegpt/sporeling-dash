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
    next.addEventListener("click", () => action("talk"));
    gotIt.addEventListener("click", () => action("lesson"));
    root.addEventListener("keydown", e => {
      if (e.target.tagName === "BUTTON") e.stopPropagation();
    });
    let lessonOpen = false;
    return {
      sync(view) {
        const visible = view.touch && (view.mode === "play" || view.mode === "reunion");
        root.hidden = !visible;
        if (!visible) { lessonOpen = false; return; }
        root.classList.toggle("is-mirrored", !!view.leftHanded);
        put(life, `Health ${view.health}/${view.maxHealth}`);
        put(blooms, `Blooms ${view.spores}/3`);
        put(berries, view.reach ? "" : `Berries ${view.berries}/${view.berriesTotal}`);
        berries.hidden = !!view.reach;
        keepsakes.hidden = !!view.reach;
        put(keepsakes, `Keepsakes ${view.keepsakes}/4`);
        timer.hidden = !view.timed;
        if (view.timed) put(timer, view.time);
        boss.hidden = view.bossPips == null;
        if (view.bossPips != null) put(boss, `Boss ${view.bossPips}/3`);
        lesson.hidden = !view.lesson;
        if (view.lesson) {
          put(lessonTitle, view.lesson.title);
          put(lessonCopy, view.lesson.lines.join(" "));
          if (!lessonOpen) gotIt.focus({ preventScroll: true });
          lessonOpen = true;
        } else lessonOpen = false;
        const content = view.lesson ? null : view.message;
        message.hidden = !content;
        if (content) {
          put(title, content.title);
          put(copy, content.text);
          next.hidden = !content.action;
          if (content.action) put(next, content.action);
          message.classList.toggle("is-dialogue", !!content.action);
        }
      },
    };
  };
})();
