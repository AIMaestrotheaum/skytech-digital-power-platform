import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ROUTES = {
  Home: "/",
  About: "/about",
  Products: "/products",
  Services: "/services",
  Industries: "/industries",
  Projects: "/projects",
  Project: "/projects",
  Blog: "/knowledge",
  Knowledge: "/knowledge",
  "Project Gallery": "/project-gallery",
  Contact: "/contact",
  "Contact Us": "/contact",
  "Talk to an Expert": "/contact",
  "Get a Quote": "/quote",
  "Get Quote": "/quote",
  "Request a Quote": "/quote",
  "Our Projects": "/projects",
  "UPS Calculator": "/ups-calculator",
  "Battery Calculator": "/battery-calculator",
  "Three Phase UPS": "/three-phase-ups",
  "AI Power Assistant": "/ai-power-assistant",
  Login: "/portal/login",
  "Portal Login": "/portal/login",
  Register: "/portal/register",
  Dashboard: "/portal/dashboard",
  Equipment: "/portal/equipment",
  "My Equipment": "/portal/equipment",
  "Service History": "/portal/service-history",
  Admin: "/admin",
  Leads: "/admin/leads",
  "Lead Management": "/admin/leads",
  Quotes: "/admin/quotes",
  "Quote Management": "/admin/quotes",
  "Service AMC": "/admin/service-amc",
  "Service & AMC": "/admin/service-amc",
  "Service Requests": "/admin/service-requests",
  "Service Request Management": "/admin/service-requests",
  Logout: "/portal/login",
  Support: "/support/amc-request",
  "AMC Request": "/support/amc-request",
};

function normalizeText(value) {
  return (
    value
      ?.replace(/\s+/g, " ")
      .trim()
      .toLowerCase() || ""
  );
}

function getRouteFromText(text) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return null;
  }

  const matchedLabel = Object.keys(ROUTES).find(
    (label) => normalizeText(label) === normalizedText
  );

  return matchedLabel ? ROUTES[matchedLabel] : null;
}

function clearAuthStorage() {
  [
    "access_token",
    "token_type",
    "role",
    "user_email",
    "user_id",
    "name",
  ].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function closeMobileMenu(nav) {
  if (!nav) return;
  nav.style.display = "";
  nav.removeAttribute("data-skytech-mobile-open");
}

function setupMobileMenu(doc) {
  const menuButton = Array.from(
    doc.querySelectorAll("button")
  ).find((button) =>
    normalizeText(button.textContent).includes("menu")
  );

  const nav = doc.querySelector("header nav");

  if (!menuButton || !nav) {
    return () => {};
  }

  let isOpen = false;
  const header = menuButton.closest("header");

  if (header) {
    const currentPosition = doc.defaultView?.getComputedStyle(header).position;
    if (currentPosition === "static") {
      header.style.position = "relative";
    }
  }

  const updateMenu = () => {
    if (doc.defaultView?.innerWidth > 767) {
      nav.style.display = "";
      nav.removeAttribute("data-skytech-mobile-open");
      isOpen = false;
      return;
    }

    if (isOpen) {
      nav.style.display = "flex";
      nav.style.flexDirection = "column";
      nav.style.position = "absolute";
      nav.style.left = "0";
      nav.style.right = "0";
      nav.style.top = "100%";
      nav.style.zIndex = "9999";
      nav.style.padding = "1rem";
      nav.style.gap = "0.75rem";
      nav.style.background = "inherit";
      nav.style.boxShadow = "0 12px 24px rgba(0,0,0,.12)";
      nav.dataset.skytechMobileOpen = "true";
    } else {
      nav.style.display = "none";
      nav.removeAttribute("data-skytech-mobile-open");
    }
  };

  const handleMenuClick = (event) => {
    if (doc.defaultView?.innerWidth > 767) return;
    event.preventDefault();
    event.stopPropagation();
    isOpen = !isOpen;
    updateMenu();
  };

  const handleResize = () => updateMenu();

  menuButton.addEventListener("click", handleMenuClick);
  doc.defaultView?.addEventListener("resize", handleResize);

  updateMenu();

  return () => {
    menuButton.removeEventListener("click", handleMenuClick);
    doc.defaultView?.removeEventListener("resize", handleResize);
    closeMobileMenu(nav);
  };
}

export default function StitchPage({ folder }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  useEffect(() => {
    document.title = "SKYTECH ELECTRICALS";

    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let iframeDocument = null;
    let handleClick = null;
    let cleanupMobileMenu = null;

    const handleLoad = () => {
      try {
        iframeDocument =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!iframeDocument) {
          return;
        }

        cleanupMobileMenu?.();
        cleanupMobileMenu = setupMobileMenu(iframeDocument);

        handleClick = (event) => {
          const target = event.target;

          if (!(target instanceof Element)) {
            return;
          }

          const element = target.closest("a, button");

          if (!element) {
            return;
          }

          if (
            element.hasAttribute("disabled") ||
            element.getAttribute("aria-disabled") === "true"
          ) {
            return;
          }

          const text = normalizeText(element.textContent);
          const aria = normalizeText(element.getAttribute("aria-label"));
          const title = normalizeText(element.getAttribute("title"));
          const href = element.getAttribute("href") || "";

          /*
           * The mobile menu toggle has its own handler.
           */
          if (text === "menu" || text.includes("menu")) {
            return;
          }

          /*
           * Real internal React routes.
           */
          if (
            href.startsWith("/") &&
            !href.startsWith("//")
          ) {
            event.preventDefault();
            event.stopPropagation();
            navigate(href);
            return;
          }

          /*
           * External links remain native.
           */
          if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:")
          ) {
            return;
          }

          /*
           * Match Stitch buttons/links by visible text,
           * aria-label, or title.
           */
          const route =
            getRouteFromText(text) ||
            getRouteFromText(aria) ||
            getRouteFromText(title);

          if (route) {
            event.preventDefault();
            event.stopPropagation();

            if (route === "/portal/login" && (text === "logout" || text === "log out")) {
              clearAuthStorage();
            }

            cleanupMobileMenu?.();
            navigate(route);
            return;
          }

          /*
           * Prevent dead Stitch placeholder links.
           */
          if (
            href === "#" ||
            href === "" ||
            href.endsWith(".html") ||
            href.startsWith("./") ||
            href.startsWith("../")
          ) {
            event.preventDefault();
            event.stopPropagation();
          }
        };

        iframeDocument.addEventListener("click", handleClick);
      } catch (error) {
        console.error(
          "Could not attach Stitch navigation:",
          error
        );
      }
    };

    iframe.addEventListener("load", handleLoad);

    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);

      if (iframeDocument && handleClick) {
        iframeDocument.removeEventListener("click", handleClick);
      }

      cleanupMobileMenu?.();
      cleanupMobileMenu = null;
    };
  }, [navigate, folder]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        title="SKYTECH ELECTRICALS"
        src={`/stitch/${folder}/code.html`}
        style={{
          width: "100%",
          height: "100vh",
          minHeight: "700px",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}
