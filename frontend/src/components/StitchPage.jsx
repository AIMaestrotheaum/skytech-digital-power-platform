import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ROUTES = {
  "Home": "/",
  "About": "/about",
  "Products": "/products",
  "Services": "/services",
  "Industries": "/industries",
  "Projects": "/projects",
  "Blog": "/knowledge",
  "Knowledge": "/knowledge",
  "Project Gallery": "/project-gallery",
  "Contact": "/contact",
  "Contact Us": "/contact",
  "Get a Quote": "/quote",
  "Our Projects": "/projects",
  "Talk to an Expert": "/contact",

  "UPS Calculator": "/ups-calculator",
  "Battery Calculator": "/battery-calculator",
  "Three Phase UPS": "/three-phase-ups",
  "AI Power Assistant": "/ai-power-assistant",

  "Login": "/portal/login",
  "Dashboard": "/portal/dashboard",
  "Equipment": "/portal/equipment",
  "Service History": "/portal/service-history",

  "Admin": "/admin",
  "Leads": "/admin/leads",
  "Lead Management": "/admin/leads",
  "Quotes": "/admin/quotes",
  "Quote Management": "/admin/quotes",
  "Service AMC": "/admin/service-amc",
  "Support": "/support/amc-request",
};

export default function StitchPage({ folder }) {
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  useEffect(() => {
    document.title = "SKYTECH ELECTRICALS";

    const iframe = iframeRef.current;

    if (!iframe) return;

    const handleLoad = () => {
      try {
        const iframeDocument =
          iframe.contentDocument ||
          iframe.contentWindow.document;

        const handleClick = (event) => {
          const target = event.target;

          /*
           * Find clicked link or button
           */
          const element = target.closest("a, button");

          if (!element) return;

          const text = element.textContent
            ?.replace(/\s+/g, " ")
            .trim();

          /*
           * First check actual href
           */
          if (element.tagName === "A") {
            const href = element.getAttribute("href");

            if (href && href.startsWith("/")) {
              event.preventDefault();
              navigate(href);
              return;
            }
          }

          /*
           * Check button/link text
           */
          const matchedRoute = Object.keys(ROUTES).find(
            (label) =>
              text?.toLowerCase() === label.toLowerCase()
          );

          if (matchedRoute) {
            event.preventDefault();
            navigate(ROUTES[matchedRoute]);
          }
        };

        iframeDocument.addEventListener(
          "click",
          handleClick
        );

        /*
         * Cleanup when iframe reloads/unmounts
         */
        return () => {
          iframeDocument.removeEventListener(
            "click",
            handleClick
          );
        };
      } catch (error) {
        console.error(
          "Could not attach Stitch navigation:",
          error
        );
      }
    };

    iframe.addEventListener("load", handleLoad);

    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, [navigate, folder]);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH ELECTRICALS"
      src={`/stitch/${folder}/code.html`}
      style={{
        width: "100%",
        height: "100vh",
        border: 0,
        display: "block",
      }}
    />
  );
}