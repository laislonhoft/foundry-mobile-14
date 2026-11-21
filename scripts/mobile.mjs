const ID = "foundry-mobile-14";
const touchDevice = matchMedia("(any-pointer: coarse)");
const directions = [
  [-1, -1, "↖", "UpLeft"], [0, -1, "↑", "Up"], [1, -1, "↗", "UpRight"],
  [-1, 0, "←", "Left"], [0, 0, "◎", "Center"], [1, 0, "→", "Right"],
  [-1, 1, "↙", "DownLeft"], [0, 1, "↓", "Down"], [1, 1, "↘", "DownRight"]
];

let mobile;

function translate(key) {
  return game.i18n.localize(`FoundryMobile14.${key}`);
}

Hooks.once("init", () => {
  game.settings.register(ID, "mode", {
    name: "FoundryMobile14.Settings.Name",
    hint: "FoundryMobile14.Settings.Hint",
    scope: "client",
    config: true,
    type: String,
    choices: {
      auto: "FoundryMobile14.Settings.Auto",
      on: "FoundryMobile14.Settings.On",
      off: "FoundryMobile14.Settings.Off"
    },
    default: "auto",
    onChange: syncMode
  });
});

Hooks.once("ready", () => {
  touchDevice.addEventListener("change", syncMode);
  Hooks.on("canvasReady", () => mobile?.refresh());
  Hooks.on("canvasTearDown", () => mobile?.resetScene());
  for (const hook of ["controlToken", "activateCanvasLayer", "updateToken", "deleteToken", "pauseGame"]) {
    Hooks.on(hook, () => mobile?.refresh());
  }
  syncMode();
});

function syncMode() {
  if (!game.ready) return;
  const mode = game.settings.get(ID, "mode");
  const enabled = mode === "on" || (mode === "auto" && touchDevice.matches);
  if (enabled && !mobile) mobile = new MobileControls();
  if (!enabled && mobile) {
    mobile.destroy();
    mobile = null;
  }
}

class MobileControls {
  events = new AbortController();
  pointers = new Map();
  frame = 0;
  moving = false;
  navigating = false;
  padOpen = false;
  directionButtons = [];

  constructor() {
    this.restoreViewport = ensureViewport();
    document.body.classList.add(ID);

    this.camera = document.createElement("div");
    this.camera.className = "fm14-camera";
    this.camera.hidden = true;
    this.camera.setAttribute("aria-hidden", "true");
    const board = document.getElementById("board");
    if (board) board.after(this.camera);
    else document.body.prepend(this.camera);

    this.dock = document.createElement("section");
    this.dock.className = "fm14-dock";
    this.dock.setAttribute("aria-label", translate("Controls"));

    this.pad = document.createElement("div");
    this.pad.className = "fm14-pad";
    this.pad.id = "fm14-direction-pad";
    this.pad.setAttribute("role", "group");
    this.pad.setAttribute("aria-label", translate("TokenMovement"));
    for (const [dx, dy, icon, label] of directions) {
      const isCenter = dx === 0 && dy === 0;
      const action = isCenter ? () => this.center() : () => this.step(dx, dy);
      const button = this.button(icon, `Direction.${label}`, action);
      if (isCenter) this.centerButton = button;
      else this.directionButtons.push(button);
      this.pad.append(button);
    }

    const bar = document.createElement("div");
    bar.className = "fm14-bar";
    this.moveButton = this.button(translate("Move"), "ToggleMovement", () => {
      this.padOpen = !this.padOpen;
      if (this.padOpen) this.setNavigation(false);
      this.refresh();
    });
    this.moveButton.setAttribute("aria-controls", this.pad.id);
    this.mapButton = this.button(translate("Navigate"), "ToggleNavigation", () => {
      this.setNavigation(!this.navigating);
    });
    this.zoomOut = this.button("−", "ZoomOut", () => this.zoom(1 / 1.25));
    this.zoomIn = this.button("+", "ZoomIn", () => this.zoom(1.25));
    this.sidebarButton = this.button(translate("Sidebar"), "ToggleSidebar", () => {
      this.setNavigation(false);
      this.padOpen = false;
      this.refresh();
      ui.sidebar?.toggleExpanded();
    });
    bar.append(this.moveButton, this.mapButton, this.zoomOut, this.zoomIn, this.sidebarButton);

    this.hint = document.createElement("div");
    this.hint.className = "fm14-hint";
    this.hint.setAttribute("role", "status");
    this.hint.textContent = translate("NavigationHint");
    this.dock.append(this.pad, this.hint, bar);
    document.body.append(this.dock);

    const options = { signal: this.events.signal };
    this.camera.addEventListener("pointerdown", event => this.pointerDown(event), options);
    this.camera.addEventListener("pointermove", event => this.pointerMove(event), options);
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
      this.camera.addEventListener(type, event => this.pointerEnd(event), options);
    }
    this.camera.addEventListener("contextmenu", event => event.preventDefault(), options);
    window.addEventListener("blur", () => this.clearGesture(), options);
    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && this.navigating) {
        event.stopPropagation();
        this.setNavigation(false);
      }
    }, { ...options, capture: true });
    this.refresh();
  }

  button(text, labelKey, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.title = translate(labelKey);
    button.setAttribute("aria-label", button.title);
    button.addEventListener("click", action, { signal: this.events.signal });
    return button;
  }

  get selection() {
    const layer = canvas?.ready ? canvas.tokens : null;
    if (!layer?.active) return [];
    return layer.controlled.filter(token => token.document.isOwner);
  }

  get movable() {
    if (game.paused && !game.user.isGM) return [];
    return this.selection.filter(token => !token.document.locked);
  }

  refresh() {
    const ready = Boolean(canvas?.ready);
    const canMove = !this.moving && this.movable.length > 0;
    this.moveButton.disabled = !ready;
    this.moveButton.setAttribute("aria-expanded", String(this.padOpen));
    this.pad.hidden = !ready || !this.padOpen;
    this.centerButton.disabled = !this.selection.length;
    for (const button of this.directionButtons) button.disabled = !canMove;
    this.mapButton.disabled = !ready;
    this.mapButton.setAttribute("aria-pressed", String(this.navigating));
    this.mapButton.textContent = translate(this.navigating ? "Play" : "Navigate");
    this.hint.hidden = !this.navigating;
    this.zoomOut.disabled = this.zoomIn.disabled = !ready;
    this.sidebarButton.disabled = !ui.sidebar;
  }

  async step(dx, dy) {
    const ids = this.movable.map(token => token.id);
    if (this.moving || !ids.length) return;
    this.moving = true;
    this.refresh();
    try {
      await canvas.tokens.moveMany({ dx, dy, ids });
    } catch (error) {
      console.error(ID, error);
      ui.notifications.warn(translate("MovementFailed"));
    } finally {
      this.moving = false;
      if (this.dock.isConnected) this.refresh();
    }
  }

  async center() {
    const [token] = this.selection;
    if (!token) return;
    try {
      await token.panCanvas({ force: true, duration: 0 });
    } catch (error) {
      console.error(ID, error);
    }
  }

  zoom(factor) {
    if (canvas?.ready) canvas.pan({ scale: canvas.stage.scale.x * factor });
  }

  setNavigation(enabled) {
    this.clearGesture();
    this.navigating = enabled && Boolean(canvas?.ready);
    if (this.navigating) {
      this.padOpen = false;
      ui.sidebar?.collapse();
    }
    document.body.classList.toggle("fm14-navigating", this.navigating);
    this.camera.hidden = !this.navigating;
    this.refresh();
  }

  pointerDown(event) {
    if (!this.navigating || event.button !== 0 || this.pointers.size >= 2) return;
    if (this.frame) this.applyGesture();
    this.camera.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    this.gesture = this.pointerGeometry();
  }

  pointerMove(event) {
    if (!this.pointers.has(event.pointerId)) return;
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (!this.frame) this.frame = requestAnimationFrame(() => this.applyGesture());
  }

  pointerEnd(event) {
    if (!this.pointers.has(event.pointerId)) return;
    if (event.type === "pointerup" && this.frame) {
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.applyGesture();
    }
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.pointers.delete(event.pointerId);
    this.gesture = this.pointerGeometry();
  }

  pointerGeometry() {
    const [first, second] = this.pointers.values();
    if (!second) return first && { point: first, distance: null };
    return {
      point: { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 },
      distance: Math.max(10, Math.hypot(first.x - second.x, first.y - second.y))
    };
  }

  applyGesture() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    if (!this.navigating || !canvas?.ready || !this.gesture || !this.pointers.size) return;
    const before = this.gesture;
    const after = this.pointerGeometry();
    const { position, pivot, scale } = canvas.stage;
    const anchor = {
      x: pivot.x + (before.point.x - position.x) / scale.x,
      y: pivot.y + (before.point.y - position.y) / scale.y
    };

    // Use the live stage properties, since PIXI can defer its world transform until rendering.
    if (before.distance && after.distance && before.distance !== after.distance) {
      canvas.pan({ scale: scale.x * after.distance / before.distance });
    }
    canvas.pan({
      x: anchor.x - (after.point.x - position.x) / scale.x,
      y: anchor.y - (after.point.y - position.y) / scale.y
    });
    this.gesture = after;
  }

  clearGesture() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    for (const id of this.pointers.keys()) {
      if (this.camera.hasPointerCapture(id)) this.camera.releasePointerCapture(id);
    }
    this.pointers.clear();
    this.gesture = null;
  }

  resetScene() {
    this.padOpen = false;
    this.setNavigation(false);
    for (const button of this.dock.querySelectorAll("button")) {
      button.disabled = button !== this.sidebarButton;
    }
  }

  destroy() {
    this.clearGesture();
    this.events.abort();
    this.camera.remove();
    this.dock.remove();
    document.body.classList.remove(ID, "fm14-navigating");
    this.restoreViewport();
  }
}

function ensureViewport() {
  const existing = document.querySelector('meta[name="viewport"]');
  const meta = existing ?? document.createElement("meta");
  const original = meta.content;
  const options = original.split(",").map(option => option.trim()).filter(Boolean);
  if (options.some(option => /^viewport-fit\s*=/i.test(option))) return () => {};
  if (!existing) options.push("width=device-width", "initial-scale=1");
  options.push("viewport-fit=cover");
  meta.name = "viewport";
  meta.content = options.join(", ");
  if (!existing) document.head.append(meta);
  return () => {
    if (existing) meta.content = original;
    else meta.remove();
  };
}
