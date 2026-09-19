import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function LeadManagement() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;

    const loadLeads = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        if (!token) return;

        const response = await fetch(
          `${API_BASE}/api/admin/leads`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Leads API error:", response.status);
          return;
        }

        const data = await response.json();

        const doc = iframe?.contentDocument;
        if (!doc) return;

        console.log("Admin leads:", data);

        /*
         * Find the main table in the Stitch page.
         */
        const table = doc.querySelector("table");

        if (!table) {
          console.warn("Lead table not found in Stitch page.");
          return;
        }

        const tbody = table.querySelector("tbody");

        if (!tbody) return;

        tbody.innerHTML = "";

        const leads = Array.isArray(data)
          ? data
          : data.leads || [];

        leads.forEach((lead) => {
          const row = doc.createElement("tr");

          row.innerHTML = `
            <td>${lead.lead_code || "-"}</td>
            <td>${lead.customer_name || "-"}</td>
            <td>${lead.company || "-"}</td>
            <td>${lead.industry || "-"}</td>
            <td>${lead.requirement || "-"}</td>
            <td>${lead.status || "-"}</td>
            <td>${lead.assigned_to || "-"}</td>
            <td>
              ${
                lead.created_at
                  ? new Date(lead.created_at).toLocaleDateString("en-IN")
                  : "-"
              }
            </td>
          `;

          /*
           * Clicking a lead stores its ID and opens
           * the Lead Detail page.
           */
          row.style.cursor = "pointer";

          row.addEventListener("click", () => {
            sessionStorage.setItem(
              "selected_lead_id",
              String(lead.id)
            );

            navigate("/admin/leads/detail");
          });

          tbody.appendChild(row);
        });

        /*
         * Update simple dashboard/count values if present.
         */
        const countElements = [
          ...doc.querySelectorAll("*"),
        ].filter(
          (el) =>
            el.children.length === 0 &&
            el.textContent?.trim() === "24"
        );

        countElements.forEach((el) => {
          el.textContent = String(leads.length);
        });
      } catch (error) {
        console.error("Lead management error:", error);
      }
    };

    const handleLoad = () => {
      loadLeads();
    };

    iframe?.addEventListener("load", handleLoad);

    return () => {
      iframe?.removeEventListener("load", handleLoad);
    };
  }, [navigate]);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Lead Management"
      src="/stitch/lead_management_skytech_admin/code.html"
      style={{
        width: "100%",
        height: "100vh",
        border: 0,
        display: "block",
      }}
    />
  );
}