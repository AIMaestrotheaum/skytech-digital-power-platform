import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

const ROUTES = {
  Dashboard: "/portal/dashboard",
  Home: "/portal/dashboard",

  Equipment: "/portal/equipment",
  "My Equipment": "/portal/equipment",

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

function clearAuthStorage() {
  const localKeys = [
    "access_token",
    "token_type",
    "role",
    "user_email",
    "user_id",
    "name",
  ];

  const sessionKeys = [
    ...localKeys,
    "selected_lead_id",
    "selected_quote_id",
    "selected_amc_id",
    "selected_amc_detail",
    "selected_service_request_id",
  ];

  localKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  sessionKeys.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

export default function EquipmentDetails() {
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
        `Equipment API failed: ${response.status}`;

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
         * Handle actual internal links.
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
           * Do not interfere with external,
           * telephone or email links.
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
         * Handle Stitch navigation buttons.
         */
        const route =
          getRouteFromText(text);

        if (route) {
          event.preventDefault();

          if (
            route === "/portal/login"
          ) {
            clearAuthStorage();
          }

          navigate(route);
          return;
        }

        /*
         * Prevent unused placeholder links
         * from jumping to the top of the page.
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

    const fetchEquipment = async (doc) => {
      try {
        const response = await apiFetch(
          "/api/customer/equipment"
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

        /*
         * Supported API responses:
         *
         * { equipment: [...] }
         *
         * or
         *
         * [...]
         */
        const equipment =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.equipment
              )
            ? data.equipment
            : [];

        /*
         * The current Stitch design is a
         * single-equipment detail page.
         *
         * Therefore display the first
         * equipment record.
         */
        const item =
          equipment[0] || {};

        /*
         * Equipment code.
         */
        replaceText(
          doc,
          [
            "EQ-001",
            "EQ-1001",
            "Equipment ID",
            "Equipment Code",
          ],
          item.equipment_code || "-"
        );

        /*
         * Equipment name.
         */
        replaceText(
          doc,
          [
            "Online UPS",
            "UPS System",
            "Equipment Name",
          ],
          item.equipment_name || "-"
        );

        /*
         * Equipment type.
         */
        replaceText(
          doc,
          [
            "Equipment Type",
            "UPS",
          ],
          item.equipment_type || "-"
        );

        /*
         * Model.
         */
        replaceText(
          doc,
          [
            "SKY-UPS-100KVA",
            "Model",
            "Model Number",
          ],
          item.model || "-"
        );

        /*
         * Serial number.
         */
        replaceText(
          doc,
          [
            "SN-001",
            "SN-12345",
            "Serial Number",
          ],
          item.serial_number || "-"
        );

        /*
         * Capacity.
         */
        replaceText(
          doc,
          [
            "100 kVA",
            "50 kVA",
            "Capacity",
          ],
          item.capacity || "-"
        );

        /*
         * Installation date.
         */
        replaceText(
          doc,
          [
            "01/01/2025",
            "Installation Date",
          ],
          item.installation_date || "-"
        );

        /*
         * Warranty end date.
         */
        replaceText(
          doc,
          [
            "31/12/2026",
            "Warranty End Date",
          ],
          item.warranty_end_date || "-"
        );

        /*
         * Location.
         */
        replaceText(
          doc,
          [
            "Pune",
            "Mumbai",
            "Location",
          ],
          item.location || "-"
        );

        /*
         * Status.
         *
         * We intentionally don't replace
         * the generic "Status" label first.
         * Only known placeholder values are
         * replaced.
         */
        replaceText(
          doc,
          [
            "Active",
            "Operational",
            "Inactive",
            "Under Maintenance",
          ],
          item.status || "-"
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Customer Equipment Error:",
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

        fetchEquipment(
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
    <div className="w-full min-h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Equipment Details"
        src="/stitch/equipment_details_skytech_portal/code.html"
        className="block w-full min-h-screen h-screen border-0"
      />
    </div>
  );
}