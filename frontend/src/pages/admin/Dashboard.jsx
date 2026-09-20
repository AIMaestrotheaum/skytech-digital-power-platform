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

    const replaceText = (
      doc,
      possibleTexts,
      newValue
    ) => {
      const elements = Array.from(
        doc.querySelectorAll("*")
      );

      const element = elements.find((el) => {
        if (el.children.length !== 0) {
          return false;
        }

        const text =
          el.textContent?.trim();

        return possibleTexts.some(
          (item) =>
            text?.toLowerCase() ===
            item.toLowerCase()
        );
      });

      if (!element) {
        return false;
      }

      element.textContent =
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
         * Total leads
         */
        replaceText(
          doc,
          ["24"],
          String(totalLeads)
        );

        /*
         * Pending quotes
         */
        replaceText(
          doc,
          ["12"],
          String(pendingQuotes)
        );

        /*
         * Active AMC
         */
        replaceText(
          doc,
          ["8"],
          String(activeAmc)
        );

        /*
         * Monthly revenue
         */
        replaceText(
          doc,
          ["₹1.2L"],
          `₹${Number(
            monthlyRevenue
          ).toLocaleString("en-IN")}`
        );

        /*
         * Open service requests
         */
        replaceText(
          doc,
          ["3"],
          String(openServiceRequests)
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
    <div className="w-full min-h-[calc(100vh-72px)] overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Admin Dashboard"
        src="/stitch/admin_dashboard_skytech/code.html"
        className="block w-full min-h-[calc(100vh-72px)] h-[calc(100vh-72px)] border-0"
      />
    </div>
  );
}