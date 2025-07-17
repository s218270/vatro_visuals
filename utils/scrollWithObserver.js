// Umożliwia scrollowanie do sekcji, nawet jeśli sticky blokuje scroll, czekając aż sekcja pojawi się w widoku
// Użycie: scrollWithObserver(targetId)
export function scrollWithObserver(targetId, options = { behavior: "smooth" }) {
  if (typeof window === "undefined") return;
  const target = document.getElementById(targetId);
  if (!target) {
    console.warn("Section not found in DOM:", targetId);
    return;
  }
  // Scrollujemy do sekcji
  target.scrollIntoView(options);
  // Obserwujemy, czy sekcja pojawiła się w widoku
  const observer = new window.IntersectionObserver(
    (entries, obs) => {
      if (entries[0].isIntersecting) {
        // Sekcja jest widoczna, scroll zakończony
        obs.disconnect();
      } else {
        // Sekcja nie jest widoczna (sticky blokuje), próbuj dalej
        target.scrollIntoView(options);
      }
    },
    {
      threshold: 0.5, // połowa sekcji musi być widoczna
    }
  );
  observer.observe(target);
}
