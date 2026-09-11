(() => {
  function showAppUpdateNotice(registration) {
    if (!registration || document.getElementById("app-update-notice")) return;
    const notice = document.createElement("div");
    notice.id = "app-update-notice";
    notice.className = "app-update-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");

    const text = document.createElement("span");
    text.textContent = "Hay una actualización disponible.";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-primary";
    button.textContent = "Actualizar";
    button.addEventListener("click", () => {
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      } else {
        window.location.reload();
      }
    });

    notice.append(text, button);
    document.body.appendChild(notice);
  }

  function registerGymServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    const assetVersion = encodeURIComponent(window.GYM_ASSET_VERSION || "dev");
    navigator.serviceWorker.register(`./sw.js?v=${assetVersion}`, { updateViaCache: "none" }).then(reg => {
      if (reg.waiting) showAppUpdateNotice(reg);
      reg.addEventListener("updatefound", () => {
        const nextWorker = reg.installing;
        if (!nextWorker) return;
        nextWorker.addEventListener("statechange", () => {
          if (nextWorker.state === "installed" && navigator.serviceWorker.controller) {
            showAppUpdateNotice(reg);
          }
        });
      });
      reg.update().catch(() => {});
    }).catch(() => {});

    let updateReloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (updateReloaded) return;
      updateReloaded = true;
      window.location.reload();
    });
  }

  window.registerGymServiceWorker = registerGymServiceWorker;
})();
