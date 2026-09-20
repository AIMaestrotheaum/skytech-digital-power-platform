import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { clearAuth } from "../../utils/auth";

const ADMIN_ROUTES = {
  dashboard: "/admin",
  "active amc": "/admin/service-amc",
  "open quotes": "/admin/quotes",
  "service requests": "/admin/service-requests",
  "new service request": "/admin/service-requests",

  "review renewal": "/admin/service-amc",
  "dispatch team": "/admin/service-requests",

  "recent enquiries": "/admin/leads",
  "view all": "/admin/leads",

  support: "/support/amc-request",
};

function cleanText(text) {
  return (text || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export default function AdminDashboard() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let isMounted = true;

    /*
     * ---------------------------------------------------------
     * KPI INJECTION
     * ---------------------------------------------------------
     */

    const replaceKpiValue = (doc, label, newValue) => {
      const labels = Array.from(
        doc.querySelectorAll("span, p, div")
      ).filter((el) => {
        if (el.children.length !== 0) {
          return false;
        }

        return (
          el.textContent?.trim().toLowerCase() ===
          label.toLowerCase()
        );
      });

      const labelElement = labels[0];

      if (!labelElement) {
        return false;
      }

      const card = labelElement.closest(
        "div.bg-surface-container-lowest, div.bg-primary-container"
      );

      if (!card) {
        return false;
      }

      const valueElement = Array.from(
        card.querySelectorAll("div")
      ).find((el) => {
        if (el.children.length !== 0) {
          return false;
        }

        const text = el.textContent?.trim() || "";

        return /^₹?[\d,.]+[MKLmk]?$/.test(text);
      });

      if (!valueElement) {
        return false;
      }

      valueElement.textContent = newValue ?? "-";

      return true;
    };

    /*
     * ---------------------------------------------------------
     * API ERROR HANDLER
     * ---------------------------------------------------------
     */

    const getErrorMessage = async (response) => {
      let message =
        `Admin Dashboard API failed: ${response.status}`;

      try {
        const errorData = await response.json();

        if (errorData?.detail) {
          message =
            typeof errorData.detail === "string"
              ? errorData.detail
              : JSON.stringify(errorData.detail);
        }
      } catch {
        // Ignore JSON parsing errors.
      }

      return message;
    };

    /*
     * ---------------------------------------------------------
     * LOAD DASHBOARD DATA
     * ---------------------------------------------------------
     */

    const loadDashboard = async () => {
      try {
        const response = await apiFetch(
          "/api/admin/dashboard"
        );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response)
          );
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        const doc =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!doc) {
          return;
        }

        const totalLeads =
          data?.total_leads ?? 0;

        const pendingQuotes =
          data?.pending_quotes ?? 0;

        const activeAmc =
          data?.active_amc ?? 0;

        const monthlyRevenue =
          data?.monthly_revenue ?? 0;

        const openServiceRequests =
          data?.open_service_requests ?? 0;

        replaceKpiValue(
          doc,
          "Total Leads",
          String(totalLeads)
        );

        replaceKpiValue(
          doc,
          "Open Quotes",
          String(pendingQuotes)
        );

        replaceKpiValue(
          doc,
          "Active AMC",
          String(activeAmc)
        );

        replaceKpiValue(
          doc,
          "Service Requests",
          String(openServiceRequests)
        );

        replaceKpiValue(
          doc,
          "Monthly Revenue",
          `₹${Number(
            monthlyRevenue
          ).toLocaleString("en-IN")}`
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Admin Dashboard Error:",
          error
        );
      }
    };

    /*
     * ---------------------------------------------------------
     * NAVIGATION HELPERS
     * ---------------------------------------------------------
     */

    const goToRoute = (path, event) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      navigate(path);
    };

    const handleLogout = (event) => {
      event.preventDefault();
      event.stopPropagation();

      clearAuth();

      window.location.href = "/portal/login";
    };

    const handleNavigationClick = (event) => {
      const target = event.target;

      if (!target) {
        return;
      }

      /*
       * Find the actual clickable element.
       */
      const clickable = target.closest(
        "a, button, [role='button']"
      );

      if (!clickable) {
        return;
      }

      const text = cleanText(
        clickable.innerText ||
          clickable.textContent ||
          ""
      );

      /*
       * -------------------------------------------------------
       * LOGOUT
       * -------------------------------------------------------
       */

      if (
        text === "logout" ||
        text.includes("logout")
      ) {
        handleLogout(event);
        return;
      }

      /*
       * -------------------------------------------------------
       * KNOWN ADMIN ROUTES
       * -------------------------------------------------------
       */

      const route = ADMIN_ROUTES[text];

      if (route) {
        goToRoute(route, event);
        return;
      }

      /*
       * -------------------------------------------------------
       * EXPORT REPORT
       *
       * Leave this alone because it is a real action/button.
       * -------------------------------------------------------
       */

      if (
        text === "export report" ||
        text.includes("export report")
      ) {
        return;
      }

      /*
       * -------------------------------------------------------
       * INVENTORY / ANALYTICS
       *
       * These screens currently do not have React routes.
       * Do NOT redirect them to an unrelated page.
       * -------------------------------------------------------
       */

      if (
        text === "inventory" ||
        text === "analytics"
      ) {
        return;
      }

      /*
       * -------------------------------------------------------
       * GENERIC href="#"
       *
       * Prevent dead-link jumps only.
       * -------------------------------------------------------
       */

      if (
        clickable.tagName === "A" &&
        (
          clickable.getAttribute("href") === "#" ||
          !clickable.getAttribute("href")
        )
      ) {
        event.preventDefault();
      }
    };

    /*
     * ---------------------------------------------------------
     * MOBILE ADMIN MENU
     * ---------------------------------------------------------
     */

    const setupMobileMenu = (doc) => {
      const buttons = Array.from(
        doc.querySelectorAll("button")
      );

      const menuButton = buttons.find((button) => {
        const icon = button.querySelector(
          ".material-symbols-outlined"
        );

        return (
          cleanText(
            icon?.textContent || ""
          ) === "menu"
        );
      });

      if (
        !menuButton ||
        menuButton.dataset.skytechMobileBound
      ) {
        return;
      }

      menuButton.dataset.skytechMobileBound = "true";

      menuButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const existingMenu =
          doc.getElementById(
            "skytech-admin-mobile-menu"
          );

        if (existingMenu) {
          existingMenu.remove();
          return;
        }

        const menu = doc.createElement("div");

        menu.id =
          "skytech-admin-mobile-menu";

        menu.style.cssText = `
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          z-index: 99999;
          background: #ffffff;
          border-bottom: 1px solid #d1d5db;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          padding: 16px;
        `;

        const items = [
          ["Dashboard", "/admin"],
          ["Active AMC", "/admin/service-amc"],
          ["Open Quotes", "/admin/quotes"],
          [
            "Service Requests",
            "/admin/service-requests",
          ],
          ["Leads", "/admin/leads"],
          ["Support", "/support/amc-request"],
          ["Logout", "/portal/login"],
        ];

        items.forEach(([label, path]) => {
          const item =
            doc.createElement("button");

          item.textContent = label;

          item.style.cssText = `
            display: block;
            width: 100%;
            padding: 14px 12px;
            border: none;
            background: transparent;
            text-align: left;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
          `;

          item.addEventListener(
            "click",
            () => {
              if (label === "Logout") {
                clearAuth();
                window.location.href =
                  "/portal/login";
              } else {
                navigate(path);
              }
            }
          );

          menu.appendChild(item);
        });

        doc.body.appendChild(menu);
      });
    };

    /*
     * ---------------------------------------------------------
     * IFRAME LOAD
     * ---------------------------------------------------------
     */

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        const doc =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!doc) {
          return;
        }

        /*
         * Attach ONE delegated click handler to the
         * entire Stitch document.
         */
        if (
          !doc.body.dataset.skytechNavigationBound
        ) {
          doc.body.dataset.skytechNavigationBound =
            "true";

          doc.addEventListener(
            "click",
            handleNavigationClick,
            true
          );
        }

        setupMobileMenu(doc);

        loadDashboard();
      }, 300);
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    /*
     * Already loaded iframe.
     */
    if (
      iframe.contentDocument?.readyState ===
      "complete"
    ) {
      handleLoad();
    }

    /*
     * ---------------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------------
     */

    return () => {
      isMounted = false;

      iframe.removeEventListener(
        "load",
        handleLoad
      );

      const doc =
        iframe.contentDocument;

      if (doc?.body) {
        doc.removeEventListener(
          "click",
          handleNavigationClick,
          true
        );
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Admin Dashboard"
        src="/stitch/admin_dashboard_skytech/code.html"
        className="block w-full min-h-screen h-screen border-0"
      />
    </div>
  );
}