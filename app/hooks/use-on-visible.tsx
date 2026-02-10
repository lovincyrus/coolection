import { useEffect } from "react";

export function useOnVisible(
  ref: React.RefObject<HTMLElement>,
  onVisible?: () => void,
) {
  useEffect(() => {
    if (onVisible && ref.current) {
      const observer = new IntersectionObserver(
        (e) => {
          if (e[0].isIntersecting) {
            onVisible();
          }
        },
        {
          root: null,
          rootMargin: "400px",
          threshold: 0,
        },
      );
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [ref, onVisible]);
}
