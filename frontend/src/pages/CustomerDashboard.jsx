import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";

const ROUTES = {
  Dashboard: "/portal/dashboard",
  Home: "/portal/dashboard",

  Equipment: "/portal/equipment",
  "My Equipment": "/portal/equipment",
  "View Equipment": "/portal/equipment",

  "Service History": "/portal/service-history",
  "View Service History": "/portal/service-history",

  "Request Service": "/support/amc-request",
  "Service Request": "/support/amc-request",
  "AMC Request": "/support/amc-request",
  Support: "/support/amc-request",

  Logout: "/portal/login",
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

export default function CustomerDashboard() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let isMounted = true;
    let iframeDocument = null;
    let handleClick = null;

    const replaceText = (
      doc,
      possibleTexts,
      newValue
    ) => {
      const elements = Array.from(
        doc.querySelectorAll("*")
      );

      const normalizedPossibleTexts =
        possibleTexts.map(normalizeText);

      const element = elements.find((el) => {
        if (el.children.length !== 0) {
          return false;
        }

        const text = normalizeText(
          el.textContent
        );

        return normalizedPossibleTexts.includes(
          text
        );
      });

      if (!element) {
        return false;
      }

      element.textContent =
        newValue ?? "-";

      return true;
    };

    const getErrorMessage = async (
      response
    ) => {
      let message =
        `Customer Dashboard API failed: ${response.status}`;

      try {
        const errorData =
          await response.json();

        if (errorData?.detail) {
          message =
            typeof errorData.detail ===
            "string"
              ? errorData.detail
              : JSON.stringify(
                  errorData.detail
                );
        }
      } catch {
        // Ignore JSON parsing errors.
      }

      return message;
    };

    const attachNavigation = (doc) => {
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

        if (
          element.hasAttribute("disabled") ||
          element.getAttribute(
            "aria-disabled"
          ) === "true"
        ) {
          return;
        }

        const text = element.textContent
          ?.replace(/\s+/g, " ")
          .trim();

        /*
         * Handle real internal links.
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
           * Leave external links,
           * tel:, mailto:, etc. alone.
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
         * Handle Stitch buttons/links
         * based on visible text.
         */
        const route =
          getRouteFromText(text);

        if (route) {
          event.preventDefault();

          if (route === "/portal/login") {
            localStorage.removeItem(
              "access_token"
            );
            localStorage.removeItem(
              "token_type"
            );
            localStorage.removeItem("role");
            localStorage.removeItem(
              "user_email"
            );
            localStorage.removeItem(
              "user_id"
            );
            localStorage.removeItem("name");

            sessionStorage.removeItem(
              "access_token"
            );
            sessionStorage.removeItem(
              "token_type"
            );
            sessionStorage.removeItem(
              "role"
            );
            sessionStorage.removeItem(
              "user_email"
            );
            sessionStorage.removeItem(
              "user_id"
            );
            sessionStorage.removeItem("name");
          }

          navigate(route);
          return;
        }

        /*
         * Prevent unused Stitch href="#"
         * links from jumping to the top.
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

      doc.addEventListener(
        "click",
        handleClick
      );
    };

    const fetchDashboard = async (doc) => {
      try {
        const response = await apiFetch(
          "/api/customer/dashboard"
        );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response)
          );
        }

        const data =
          await response.json();

        if (!isMounted) {
          return;
        }

        const customer =
          data?.customer || {};

        /*
         * Customer name.
         */
        replaceText(
          doc,
          [
            "John Doe",
            "John Smith",
            "Customer Name",
            "Acme Manufacturing Corp.",
          ],
          customer.name || "-"
        );

        /*
         * Equipment count.
         *
         * NOTE:
         * This still relies on the Stitch
         * dashboard's existing placeholder.
         */
        replaceText(
          doc,
          [
            "12",
            "8",
            "5",
            "Total Equipment",
          ],
          String(
            data?.equipment_count ?? 0
          )
        );

        /*
         * Service requests.
         */
        replaceText(
          doc,
          [
            "3",
            "5",
            "2",
            "Service Requests",
          ],
          String(
            data?.service_requests ?? 0
          )
        );

        /*
         * Active AMC.
         */
        replaceText(
          doc,
          [
            "1",
            "2",
            "Active AMC",
          ],
          String(
            data?.active_amc ?? 0
          )
        );

        /*
         * Customer email.
         */
        replaceText(
          doc,
          [
            "customer@example.com",
            "john@example.com",
          ],
          customer.email || "-"
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Customer Dashboard Error:",
          error
        );
      }
    };

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(
          timeoutId
        );
      }

      timeoutId = window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        iframeDocument =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!iframeDocument) {
          return;
        }

        attachNavigation(
          iframeDocument
        );

        fetchDashboard(
          iframeDocument
        );
      }, 300);
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    if (
      iframe.contentDocument?.readyState ===
      "complete"
    ) {
      handleLoad();
    }

    return () => {
      isMounted = false;

      iframe.removeEventListener(
        "load",
        handleLoad
      );

      if (timeoutId !== null) {
        window.clearTimeout(
          timeoutId
        );
      }

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
  }, [navigate]);

  return (
    <div className="w-full min-h-[calc(100vh-72px)] overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Customer Dashboard"
        src="/stitch/customer_dashboard_skytech_electricals/code.html"
        className="block w-full min-h-[calc(100vh-72px)] h-[calc(100vh-72px)] border-0"
      />
    </div>
  );
}