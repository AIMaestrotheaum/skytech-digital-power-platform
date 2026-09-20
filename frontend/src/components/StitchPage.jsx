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

  Support: "/support/amc-request",
  "AMC Request": "/support/amc-request",
};

function normalizeText(value) {
  return value
    ?.replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function getRouteFromText(text) {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return null;
  }

  const matchedLabel = Object.keys(ROUTES).find(
    (label) =>
      normalizeText(label) === normalizedText
  );

  return matchedLabel
    ? ROUTES[matchedLabel]
    : null;
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

    const handleLoad = () => {
      try {
        iframeDocument =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!iframeDocument) {
          return;
        }

        handleClick = (event) => {
          const target = event.target;

          if (!(target instanceof Element)) {
            return;
          }

          const element =
            target.closest("a, button");

          if (!element) {
            return;
          }

          /*
           * Ignore disabled controls.
           */
          if (
            element.hasAttribute("disabled") ||
            element.getAttribute("aria-disabled") ===
              "true"
          ) {
            return;
          }

          const text = element.textContent
            ?.replace(/\s+/g, " ")
            .trim();

          /*
           * 1. Handle real internal hrefs.
           *
           * Example:
           * href="/contact"
           * href="/projects"
           */
          if (element.tagName === "A") {
            const href =
              element.getAttribute("href");

            if (
              href &&
              href.startsWith("/") &&
              !href.startsWith("//")
            ) {
              event.preventDefault();
              navigate(href);
              return;
            }

            /*
             * External links are intentionally
             * left alone.
             */
            if (
              href &&
              (
                href.startsWith("http://") ||
                href.startsWith("https://") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:")
              )
            ) {
              return;
            }
          }

          /*
           * 2. Handle known Stitch navigation
           * based on visible text.
           */
          const route =
            getRouteFromText(text);

          if (route) {
            event.preventDefault();
            navigate(route);
            return;
          }

          /*
           * 3. Prevent placeholder href="#"
           * links from jumping to the top of the
           * iframe when they are not mapped.
           *
           * This is deliberately done AFTER route
           * matching so useful Stitch links still work.
           */
          if (element.tagName === "A") {
            const href =
              element.getAttribute("href");

            if (
              href === "#" ||
              href === "" ||
              href === null
            ) {
              event.preventDefault();
            }
          }
        };

        iframeDocument.addEventListener(
          "click",
          handleClick
        );
      } catch (error) {
        console.error(
          "Could not attach Stitch navigation:",
          error
        );
      }
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    /*
     * Cleanup iframe event listeners properly.
     */
    return () => {
      iframe.removeEventListener(
        "load",
        handleLoad
      );

      if (
        iframeDocument &&
        handleClick
      ) {
        iframeDocument.removeEventListener(
          "click",
          handleClick
        );
      }
    };
  }, [navigate, folder]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - 72px)",
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
          height: "calc(100vh - 72px)",
          minHeight: "700px",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}