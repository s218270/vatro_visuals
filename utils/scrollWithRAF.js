// Płynne scrollowanie do sekcji, nawet jeśli sticky blokuje scroll, z użyciem requestAnimationFrame
// Użycie: scrollWithRAF(targetId, options)
export function scrollWithRAF(
  targetId,
  options = { behavior: "smooth", block: "start" },
) {
  // Globalny lock na czas animacji scrolla
  if (window.__scrollWithRAFLock) {
    // Jeśli animacja scrolla trwa, ignoruj kolejne wywołania
    return;
  }

  if (typeof window === "undefined") return;
  window.__scrollWithRAFLock = true;
  // Znajdź wrapper LogoAnimation
  const logoWrapper = document.querySelector(
    ".h-\\[400vh\\], .h-\\[300vh\\], .h-\\[200vh\\]",
  );
  let originalHeight = null;
  if (logoWrapper) {
    originalHeight = logoWrapper.style.height;
    logoWrapper.style.height = "100vh";
  }

  // Funkcja ease x^4
  function easeX4(t) {
    // Ease out x^4
    return 1 - Math.pow(1 - t, 4);
  }

  setTimeout(() => {
    let startY = window.scrollY;
    let targetY;
    let scrollToTop = false;
    if (targetId === null) {
      // Scrolluj na górę strony
      targetY = 0;
      scrollToTop = true;
    } else {
      const target = document.getElementById(targetId);
      if (!target) {
        console.warn("Section not found in DOM:", targetId);
        // Przywróć oryginalną wysokość LogoAnimation (upewnij się, że zostanie ustawiona)
        function restoreHeight() {
          if (logoWrapper) {
            logoWrapper.style.height = originalHeight || "";
            // Sprawdź, czy wysokość została ustawiona
            const computed = getComputedStyle(logoWrapper).height;
            // Jeśli nie jest 400vh, ponów próbę
            if (
              originalHeight &&
              !computed.includes("400vh") &&
              !computed.includes("300vh") &&
              !computed.includes("200vh")
            ) {
              setTimeout(restoreHeight, 50);
              return;
            }
          }
          // Zwolnij lock po przywróceniu wysokości
          window.__scrollWithRAFLock = false;
        }
        restoreHeight();
        return;
      }
      const rect = target.getBoundingClientRect();
      targetY = rect.top + window.scrollY;
    }
    let startTime = null;
    const duration = 900; // ms

    function animateScroll(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = easeX4(progress);
      window.scrollTo(0, startY + (targetY - startY) * ease);
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        const target =
          !scrollToTop && targetId !== null
            ? document.getElementById(targetId)
            : null;
        const targetTopBeforeRestore = target?.getBoundingClientRect().top;
        // Przywróć oryginalną wysokość LogoAnimation
        if (logoWrapper) {
          logoWrapper.style.height = originalHeight || "";
          // Wymuś przeliczenie układu i wyrównaj viewport przed repaintem.
          if (target && targetTopBeforeRestore !== undefined) {
            const targetTopAfterRestore = target.getBoundingClientRect().top;
            window.scrollBy({
              top: targetTopAfterRestore - targetTopBeforeRestore,
              behavior: "auto",
            });
          }
          // MutationObserver pilnujący wysokości
          const expectedHeights = ["400vh", "300vh", "200vh"];
          const observer = new MutationObserver(() => {
            const computed = getComputedStyle(logoWrapper).height;
            if (!expectedHeights.some((h) => computed.includes(h))) {
              logoWrapper.style.height = "400vh";
            } else {
              observer.disconnect();
            }
          });
          observer.observe(logoWrapper, {
            attributes: true,
            attributeFilter: ["style", "class"],
          });
          // Fallback po 1s
          setTimeout(() => {
            const computed = getComputedStyle(logoWrapper).height;
            if (!expectedHeights.some((h) => computed.includes(h))) {
              logoWrapper.style.height = "400vh";
            }
            observer.disconnect();
          }, 1000);
        }
        window.__scrollWithRAFLock = false;
        // Resetuj scrollTo w URL
        if (typeof window !== "undefined") {
          const url = new URL(window.location);
          url.searchParams.delete("scrollTo");
          window.history.replaceState({}, document.title, url.pathname);
        }
      }
    }
    requestAnimationFrame(animateScroll);
  }, 0);
}
