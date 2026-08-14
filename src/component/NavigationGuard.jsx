import { useEffect } from "react";

const NavigationGuard = () => {
  useEffect(() => {
    // Add a history entry for the current page
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Immediately restore the current page
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
};

export default NavigationGuard;