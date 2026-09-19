import { useEffect } from "react";
import { logout } from "../utils/auth";

export default function StitchLogout({
  iframeRef,
}) {
  useEffect(() => {
    const iframe = iframeRef?.current;

    if (!iframe) return;

    let logoutElements = [];

    const setupLogout = () => {
      const doc = iframe.contentDocument;

      if (!doc) return;

      const elements = Array.from(
        doc.querySelectorAll(
          "button, a, [role='button']"
        )
      );

      logoutElements = elements.filter(
        (element) => {
          const text =
            element.textContent
              ?.trim()
              .toLowerCase() || "";

          const aria =
            element
              .getAttribute("aria-label")
              ?.toLowerCase() || "";

          const title =
            element
              .getAttribute("title")
              ?.toLowerCase() || "";

          const combined =
            `${text} ${aria} ${title}`;

          return (
            combined.includes("logout") ||
            combined.includes("log out") ||
            combined.includes("sign out") ||
            combined.includes("signout")
          );
        }
      );

      logoutElements.forEach(
        (element) => {
          const handler = (event) => {
            event.preventDefault();

            logout();
          };

          element.__skytechLogoutHandler =
            handler;

          element.addEventListener(
            "click",
            handler
          );
        }
      );

      console.log(
        "SKYTECH logout connected:",
        logoutElements.length
      );
    };

    const handleLoad = () => {
      setTimeout(
        setupLogout,
        300
      );
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    if (
      iframe.contentDocument
        ?.readyState ===
      "complete"
    ) {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener(
        "load",
        handleLoad
      );

      logoutElements.forEach(
        (element) => {
          const handler =
            element.__skytechLogoutHandler;

          if (handler) {
            element.removeEventListener(
              "click",
              handler
            );

            delete element.__skytechLogoutHandler;
          }
        }
      );
    };
  }, [iframeRef]);

  return null;
}