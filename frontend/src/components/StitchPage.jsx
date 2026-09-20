import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ROUTES = {
  about: "/about",
  products: "/products",
  services: "/services",
  industries: "/industries",
  projects: "/projects",
  "project gallery": "/project-gallery",
  blog: "/knowledge",
  "knowledge center": "/knowledge",
  "get a quote": "/quote",
  "talk to an expert": "/contact",
  contact: "/contact",
  "contact us": "/contact",
  "contact support": "/contact",

  "portal login": "/portal/login",
  login: "/portal/login",
  register: "/portal/register",

  "customer portal": "/portal/login",
  "customer dashboard": "/portal/dashboard",

  "ups calculator": "/ups-calculator",
  "battery calculator": "/battery-calculator",
  "three phase ups": "/three-phase-ups",
  "ai power assistant": "/ai-power-assistant",

  "service history": "/portal/service-history",
  equipment: "/portal/equipment",

  "amc request": "/support/amc-request",
  "request service": "/support/amc-request",
  support: "/support/amc-request",
};

function cleanText(text) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function navigateFromText(text, navigate) {
  const clean = cleanText(text);

  if (!clean) return false;

  const exactRoute = ROUTES[clean];

  if (exactRoute) {
    navigate(exactRoute);
    return true;
  }

  return false;
}

export default function StitchPage({ folder }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument;

        if (!doc) return;

        /*
         * ---------------------------------------------------------
         * 1. NORMAL LINKS
         * ---------------------------------------------------------
         */

        doc.querySelectorAll("a").forEach((link) => {
          if (link.dataset.skytechNavigationBound) return;

          link.dataset.skytechNavigationBound = "true";

          link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            const text = cleanText(link.innerText || link.textContent || "");

            /*
             * Real internal route already exists.
             */
            if (href && href.startsWith("/")) {
              const path = href.split("?")[0].split("#")[0];

              if (
                [
                  "/about",
                  "/products",
                  "/services",
                  "/industries",
                  "/projects",
                  "/project-gallery",
                  "/knowledge",
                  "/contact",
                  "/quote",
                  "/ups-calculator",
                  "/battery-calculator",
                  "/three-phase-ups",
                  "/ai-power-assistant",
                  "/portal/login",
                  "/portal/register",
                  "/portal/dashboard",
                  "/portal/equipment",
                  "/portal/service-history",
                  "/support/amc-request",
                  "/admin",
                  "/admin/leads",
                  "/admin/quotes",
                  "/admin/service-amc",
                  "/admin/service-requests",
                ].includes(path)
              ) {
                event.preventDefault();
                event.stopPropagation();

                navigate(path);
                return;
              }
            }

            /*
             * Stitch commonly uses href="#".
             * Use the visible text to determine the React route.
             */
            if (!href || href === "#" || href.startsWith("#")) {
              if (navigateFromText(text, navigate)) {
                event.preventDefault();
                event.stopPropagation();
              }
            }
          });
        });

        /*
         * ---------------------------------------------------------
         * 2. BUTTONS
         * ---------------------------------------------------------
         */

        doc.querySelectorAll("button").forEach((button) => {
          if (button.dataset.skytechNavigationBound) return;

          button.dataset.skytechNavigationBound = "true";

          button.addEventListener("click", (event) => {
            const text = cleanText(
              button.innerText || button.textContent || ""
            );

            /*
             * Mobile menu is handled separately below.
             */
            if (
              button.classList.contains("md:hidden") ||
              text === "menu"
            ) {
              return;
            }

            /*
             * Don't intercept buttons inside forms.
             * This preserves Submit / Calculate / Reset behaviour.
             */
            if (
              button.closest("form") ||
              button.type === "submit" ||
              button.type === "reset"
            ) {
              return;
            }

            if (navigateFromText(text, navigate)) {
              event.preventDefault();
              event.stopPropagation();
            }
          });
        });

        /*
         * ---------------------------------------------------------
         * 3. MOBILE HAMBURGER MENU
         * ---------------------------------------------------------
         */

        const menuButton =
          doc.querySelector("button.md\\:hidden") ||
          Array.from(doc.querySelectorAll("button")).find((button) => {
            const text = cleanText(
              button.innerText || button.textContent || ""
            );

            return (
              text === "menu" ||
              button.querySelector(".material-symbols-outlined")
                ?.textContent
                ?.trim() === "menu"
            );
          });

        if (menuButton && !menuButton.dataset.skytechMobileBound) {
          menuButton.dataset.skytechMobileBound = "true";

          menuButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            /*
             * Stitch pages sometimes already contain a hidden
             * mobile navigation container.
             */
            const possibleMenus = Array.from(
              doc.querySelectorAll("nav, [role='navigation'], .mobile-menu")
            );

            let menu = possibleMenus.find((element) => {
              const style = window.getComputedStyle(element);

              return (
                style.display === "none" ||
                element.classList.contains("hidden") ||
                element.classList.contains("md:hidden")
              );
            });

            if (!menu) {
              /*
               * If the Stitch screen has no mobile menu markup,
               * create a small navigation overlay inside the iframe.
               */
              menu = doc.createElement("div");

              menu.id = "skytech-mobile-navigation";

              menu.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 99999;
                background: white;
                padding: 24px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                font-family: Inter, sans-serif;
              `;

              const routes = [
                ["Home", "/"],
                ["About", "/about"],
                ["Products", "/products"],
                ["Services", "/services"],
                ["Industries", "/industries"],
                ["Projects", "/projects"],
                ["Knowledge Center", "/knowledge"],
                ["Contact", "/contact"],
                ["Get a Quote", "/quote"],
                ["Portal Login", "/portal/login"],
              ];

              routes.forEach(([label, path]) => {
                const item = doc.createElement("button");

                item.textContent = label;

                item.style.cssText = `
                  display: block;
                  width: 100%;
                  padding: 14px 8px;
                  border: none;
                  background: transparent;
                  text-align: left;
                  font-size: 16px;
                  font-weight: 600;
                  cursor: pointer;
                `;

                item.addEventListener("click", () => {
                  navigate(path);
                });

                menu.appendChild(item);
              });

              doc.body.appendChild(menu);
            } else {
              menu.classList.toggle("hidden");

              if (menu.style.display === "none") {
                menu.style.display = "block";
              } else if (menu.dataset.skytechOpened === "true") {
                menu.style.display = "none";
              }

              menu.dataset.skytechOpened =
                menu.dataset.skytechOpened === "true"
                  ? "false"
                  : "true";
            }
          });
        }

        /*
         * ---------------------------------------------------------
         * 4. MATERIAL ICON CONTACT SUPPORT BUTTON
         * ---------------------------------------------------------
         */

        doc.querySelectorAll("button").forEach((button) => {
          const icon = button.querySelector(".material-symbols-outlined");

          if (!icon) return;

          const iconName = cleanText(icon.textContent || "");

          if (
            iconName === "contact_support" &&
            !button.dataset.skytechContactBound
          ) {
            button.dataset.skytechContactBound = "true";

            button.addEventListener("click", (event) => {
              event.preventDefault();
              event.stopPropagation();

              navigate("/contact");
            });
          }
        });

        /*
         * ---------------------------------------------------------
         * 5. TEXT LINKS SUCH AS "GET A QUOTE"
         * ---------------------------------------------------------
         */

        const clickableTextElements = doc.querySelectorAll(
          "a, button, [role='button']"
        );

        clickableTextElements.forEach((element) => {
          const text = cleanText(
            element.innerText || element.textContent || ""
          );

          if (!text) return;

          /*
           * Only apply to known navigation labels.
           */
          if (!ROUTES[text]) return;

          if (element.dataset.skytechTextRouteBound) return;

          element.dataset.skytechTextRouteBound = "true";

          element.addEventListener("click", (event) => {
            /*
             * Never override form submission.
             */
            if (element.closest("form")) return;

            event.preventDefault();
            event.stopPropagation();

            navigate(ROUTES[text]);
          });
        });
      } catch (error) {
        console.error(
          "SKYTECH Stitch navigation error:",
          error
        );
      }
    };

    iframe.addEventListener("load", handleLoad);

    /*
     * If iframe is already loaded.
     */
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [folder, navigate]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <iframe
        ref={iframeRef}
        src={`/stitch/${folder}/code.html`}
        title={folder}
        style={{
          display: "block",
          width: "100%",
          height: "100vh",
          minHeight: "700px",
          border: "none",
        }}
      />
    </div>
  );
}