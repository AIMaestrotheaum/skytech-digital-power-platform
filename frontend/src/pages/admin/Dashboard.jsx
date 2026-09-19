import { useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function AdminDashboard() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    const loadDashboard = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        if (!token) return;

        const response = await fetch(
          `${API_BASE}/api/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Dashboard API error:", response.status);
          return;
        }

        const data = await response.json();

        const doc = iframe?.contentDocument;
        if (!doc) return;

        /*
         * Update dashboard values while preserving
         * the original Stitch design.
         */

        const text = doc.body.innerText;

        // Dashboard statistics
        const values = {
          totalLeads: data.total_leads ?? 0,
          pendingQuotes: data.pending_quotes ?? 0,
          activeAmc: data.active_amc ?? 0,
          monthlyRevenue: data.monthly_revenue ?? 0,
          openServiceRequests: data.open_service_requests ?? 0,
        };

        // Try to update elements based on their visible text.
        const allElements = [...doc.body.querySelectorAll("*")];

        const replaceText = (oldText, newText) => {
          const element = allElements.find(
            (el) =>
              el.children.length === 0 &&
              el.textContent?.trim() === oldText
          );

          if (element) {
            element.textContent = String(newText);
          }
        };

        /*
         * Common Stitch demo values.
         * These replacements are safe even if some values
         * are not present in the current Stitch screen.
         */

        replaceText("24", values.totalLeads);
        replaceText("12", values.pendingQuotes);
        replaceText("8", values.activeAmc);
        replaceText("₹1.2L", `₹${Number(values.monthlyRevenue).toLocaleString("en-IN")}`);
        replaceText("3", values.openServiceRequests);

        console.log("Admin dashboard data:", data);
      } catch (error) {
        console.error("Admin dashboard error:", error);
      }
    };

    const handleLoad = () => {
      loadDashboard();
    };

    iframe?.addEventListener("load", handleLoad);

    return () => {
      iframe?.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Admin Dashboard"
      src="/stitch/admin_dashboard_skytech/code.html"
      style={{
        width: "100%",
        height: "100vh",
        border: 0,
        display: "block",
      }}
    />
  );
}