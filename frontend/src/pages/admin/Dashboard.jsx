import { useEffect, useRef } from "react";
import { apiFetch } from "../../utils/api";

export default function AdminDashboard() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let isMounted = true;

    const replaceKpiValue = (
      doc,
      label,
      newValue
    ) => {
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

        return (
          /^₹?[\d,.]+[MKLmk]?$/.test(text)
        );
      });

      if (!valueElement) {
        return false;
      }

      valueElement.textContent =
        newValue ?? "-";

      return true;
    };

    const getErrorMessage = async (response) => {
      let message =
        `Admin Dashboard API failed: ${response.status}`;

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

        const data =
          await response.json();

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

        /*
         * KPI values are located relative to
         * their Stitch labels so unrelated
         * numbers elsewhere on the dashboard
         * are never overwritten.
         */
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

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        loadDashboard();
      }, 300);
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    /*
     * Handle an iframe that has already loaded.
     */
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
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

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