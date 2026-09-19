import { useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";
import { logout } from "../utils/auth";

export default function AdminDashboard() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    // =========================================================
    // FIND TEXT ELEMENT
    // =========================================================

    const findTextElement = (doc, text) => {
      const main =
        doc.querySelector("main") || doc.body;

      if (!main) return null;

      return Array.from(
        main.querySelectorAll("*")
      ).find(
        (element) =>
          element.children.length === 0 &&
          element.textContent?.trim() === text
      );
    };

    // =========================================================
    // API ERROR
    // =========================================================

    const getApiErrorMessage = async (
      response
    ) => {
      try {
        const data = await response.json();

        if (Array.isArray(data?.detail)) {
          return data.detail
            .map((item) => {
              const location =
                Array.isArray(item?.loc)
                  ? item.loc
                      .filter(Boolean)
                      .join(".")
                  : "field";

              return `${location}: ${
                item?.msg ||
                "Invalid value"
              }`;
            })
            .join("\n");
        }

        if (
          typeof data?.detail ===
          "string"
        ) {
          return data.detail;
        }

        if (
          data?.detail &&
          typeof data.detail ===
            "object"
        ) {
          return (
            data.detail.msg ||
            JSON.stringify(
              data.detail,
              null,
              2
            )
          );
        }

        if (data?.message) {
          return data.message;
        }
      } catch {
        // Ignore JSON parsing errors
      }

      return `Request failed with status ${response.status}`;
    };

    // =========================================================
    // CONNECT LOGOUT
    // =========================================================

    const connectLogout = (doc) => {
      if (
        doc.body.dataset.logoutConnected ===
        "true"
      ) {
        return;
      }

      doc.body.dataset.logoutConnected =
        "true";

      doc.addEventListener(
        "click",
        (event) => {
          const clickedElement =
            event.target.closest(
              "a, button, [role='button']"
            );

          if (!clickedElement) {
            return;
          }

          const text =
            clickedElement.textContent
              ?.trim()
              .toLowerCase() || "";

          const aria =
            clickedElement
              .getAttribute("aria-label")
              ?.trim()
              .toLowerCase() || "";

          const title =
            clickedElement
              .getAttribute("title")
              ?.trim()
              .toLowerCase() || "";

          const combined =
            `${text} ${aria} ${title}`;

          if (
            combined.includes("logout") ||
            combined.includes("log out") ||
            combined.includes("sign out")
          ) {
            event.preventDefault();
            event.stopPropagation();

            logout();
          }
        },
        true
      );
    };

    // =========================================================
    // UPDATE KPI
    // =========================================================

    const updateKpi = (
      doc,
      label,
      value
    ) => {
      const labelElement =
        findTextElement(doc, label);

      if (!labelElement) return;

      const card =
        labelElement.closest(
          "div.bg-surface-container-lowest, div.bg-primary-container"
        );

      if (!card) return;

      const valueElement =
        card.querySelector(
          ".font-data-mono.text-display-lg"
        );

      if (valueElement) {
        valueElement.textContent =
          value;
      }
    };

    // =========================================================
    // UPDATE REVENUE
    // =========================================================

    const updateRevenue = (
      doc,
      monthlyRevenue
    ) => {
      const revenueElement =
        findTextElement(
          doc,
          "₹1.2M"
        );

      if (!revenueElement) return;

      const revenue = Number(
        monthlyRevenue || 0
      );

      let formattedRevenue;

      if (revenue >= 1000000) {
        formattedRevenue =
          `₹${(
            revenue / 1000000
          ).toFixed(1)}M`;
      } else if (revenue >= 1000) {
        formattedRevenue =
          `₹${(
            revenue / 1000
          ).toFixed(0)}K`;
      } else {
        formattedRevenue =
          `₹${revenue.toLocaleString(
            "en-IN"
          )}`;
      }

      revenueElement.textContent =
        formattedRevenue;
    };

    // =========================================================
    // UPDATE CRITICAL COUNT
    // =========================================================

    const updateCriticalCount = (
      doc,
      alerts
    ) => {
      const criticalCount =
        Array.isArray(alerts)
          ? alerts.length
          : 0;

      const serviceLabel =
        findTextElement(
          doc,
          "Service Requests"
        );

      if (!serviceLabel) return;

      const card =
        serviceLabel.closest(
          "div.bg-surface-container-lowest"
        );

      const criticalElement =
        card?.querySelector(
          ".text-error"
        );

      if (criticalElement) {
        criticalElement.innerHTML = `
          <span class="material-symbols-outlined text-[14px]">
            arrow_upward
          </span>
          ${criticalCount}
        `;
      }
    };

    // =========================================================
    // UPDATE RECENT ENQUIRIES
    // =========================================================

    const updateRecentEnquiries = (
      doc,
      recentEnquiries
    ) => {
      const recentHeading =
        findTextElement(
          doc,
          "Recent Enquiries"
        );

      if (!recentHeading) return;

      const table =
        recentHeading.closest(
          "div"
        )?.parentElement;

      const tbody =
        table?.querySelector("tbody");

      if (!tbody) return;

      tbody.innerHTML = "";

      recentEnquiries.forEach(
        (lead, index) => {
          const row =
            doc.createElement("tr");

          row.className =
            index ===
            recentEnquiries.length - 1
              ? "hover:bg-surface transition-colors"
              : "border-b border-outline-variant hover:bg-surface transition-colors";

          const status =
            String(
              lead.status || "new"
            ).toUpperCase();

          let statusClass =
            "bg-secondary/10 text-secondary";

          let dotClass =
            "bg-secondary";

          if (
            status === "CONTACTED" ||
            status === "IN_PROGRESS"
          ) {
            statusClass =
              "bg-surface-variant text-on-surface-variant";

            dotClass =
              "bg-outline";
          }

          if (
            status === "QUALIFIED" ||
            status === "CONVERTED"
          ) {
            statusClass =
              "bg-secondary/10 text-secondary";

            dotClass =
              "bg-secondary";
          }

          row.innerHTML = `
            <td class="py-sm px-md font-data-mono text-on-surface-variant">
              ${lead.lead_code ?? "-"}
            </td>

            <td class="py-sm px-md font-semibold text-primary">
              ${lead.customer_name ?? "-"}
            </td>

            <td class="py-sm px-md text-on-surface">
              ${lead.company ?? "-"}
            </td>

            <td class="py-sm px-md">
              <span class="inline-flex items-center gap-1 font-label-caps text-[10px] ${statusClass} px-2 py-0.5 rounded-full">
                <span class="w-1.5 h-1.5 rounded-full ${dotClass}"></span>
                ${status}
              </span>
            </td>

            <td class="py-sm px-md text-on-surface-variant">
              ${lead.assigned_to ?? "-"}
            </td>
          `;

          tbody.appendChild(row);
        }
      );
    };

    // =========================================================
    // UPDATE EMERGENCY SERVICE ALERT
    // =========================================================

    const updateEmergencyAlert = (
      doc,
      alerts
    ) => {
      if (
        !Array.isArray(alerts) ||
        alerts.length === 0
      ) {
        return;
      }

      const firstAlert = alerts[0];

      const emergencyHeading =
        findTextElement(
          doc,
          "Emergency Service Requests"
        );

      if (!emergencyHeading) return;

      const alertContainer =
        emergencyHeading.parentElement?.querySelector(
          "div.bg-error\\/10"
        );

      if (!alertContainer) return;

      const title =
        alertContainer.querySelector(
          ".font-semibold.text-error"
        );

      const description =
        alertContainer.querySelector(
          ".text-\\[12px\\].text-on-surface-variant"
        );

      if (title) {
        title.textContent =
          firstAlert.issue ||
          "Critical Service Request";
      }

      if (description) {
        description.textContent =
          `${
            firstAlert.company ||
            firstAlert.customer_name ||
            "Customer"
          } - ${
            firstAlert.status ||
            "Open"
          }`;
      }
    };

    // =========================================================
    // FETCH ADMIN DASHBOARD
    // =========================================================

    const setupDashboard = async () => {
      const doc =
        iframe.contentDocument;

      if (!doc) return;

      connectLogout(doc);

      try {
        const response =
          await apiFetch(
            "/api/admin/dashboard"
          );

        if (!response.ok) {
          throw new Error(
            await getApiErrorMessage(
              response
            )
          );
        }

        const data =
          await response.json();

        console.log(
          "Admin Dashboard API:",
          data
        );

        // -----------------------------------------------------
        // KPI CARDS
        // -----------------------------------------------------

        updateKpi(
          doc,
          "Total Leads",
          String(
            data.total_leads ?? 0
          )
        );

        updateKpi(
          doc,
          "Open Quotes",
          String(
            data.open_quotes ?? 0
          )
        );

        updateKpi(
          doc,
          "Active AMC",
          String(
            data.active_amc ?? 0
          )
        );

        updateKpi(
          doc,
          "Service Requests",
          String(
            data.service_requests ?? 0
          )
        );

        // -----------------------------------------------------
        // REVENUE
        // -----------------------------------------------------

        updateRevenue(
          doc,
          data.monthly_revenue
        );

        // -----------------------------------------------------
        // CRITICAL ALERTS
        // -----------------------------------------------------

        const criticalAlerts =
          Array.isArray(
            data.critical_alerts
          )
            ? data.critical_alerts
            : [];

        updateCriticalCount(
          doc,
          criticalAlerts
        );

        // -----------------------------------------------------
        // RECENT ENQUIRIES
        // -----------------------------------------------------

        const recentEnquiries =
          Array.isArray(
            data.recent_enquiries
          )
            ? data.recent_enquiries
            : [];

        updateRecentEnquiries(
          doc,
          recentEnquiries
        );

        // -----------------------------------------------------
        // EMERGENCY ALERT
        // -----------------------------------------------------

        updateEmergencyAlert(
          doc,
          criticalAlerts
        );

        // -----------------------------------------------------
        // MARK CONNECTED
        // -----------------------------------------------------

        doc.body.dataset.dashboardConnected =
          "true";
      } catch (error) {
        console.error(
          "Admin Dashboard API Error:",
          error
        );
      }
    };

    // =========================================================
    // IFRAME LOAD
    // =========================================================

    const handleLoad = () => {
      setTimeout(() => {
        setupDashboard();
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
      setupDashboard();
    }

    return () => {
      iframe.removeEventListener(
        "load",
        handleLoad
      );
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Admin Dashboard"
      src="/stitch/admin_dashboard_skytech/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}