import { useEffect } from "react";

export const useScrollspy = () => {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[data-scrollspy='true']"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible?.target?.id) return;
        window.history.replaceState(null, "", `#${visible.target.id}`);
      },
      { threshold: 0.6 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.querySelector(hash) as HTMLElement | null;
    if (!target) return;
    const timer = window.setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    return () => window.clearTimeout(timer);
  }, []);
};
