import { useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function LeadDetail() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    const loadLead = async () => {
      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");

        const leadId = sessionStorage.getItem("selected_lead_id");

        if (!token || !leadId) {
          console.warn("No authentication token or selected lead.");
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/admin/leads/${leadId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          console.error("Lead detail API error:", response.status);
          return;
        }

        const lead = await response.json();

        const doc = iframe?.contentDocument;
        if (!doc) return;

        console.log("Selected lead:", lead);

        /*
         * Replace visible Stitch demo values
         * with real API data.
         */
        const replacements = {
          "LD-4092": lead.lead_code,
          "Rohan Sharma": lead.customer_name,
          "ABC Industries": lead.company,
          "Manufacturing": lead.industry,
          "100kVA UPS": lead.requirement,
          "New": lead.status,
        };

        const elements = [
          ...doc.querySelectorAll("*"),
        ].filter((el) => el.children.length === 0);

        elements.forEach((element) => {
          const current = element.textContent?.trim();

          if (
            current &&
            replacements[current] !== undefined &&
            replacements[current] !== null
          ) {
            element.textContent = String(replacements[current]);
          }
        });

        /*
         * Also populate inputs/textareas if the Stitch
         * detail page contains editable fields.
         */
        const inputs = doc.querySelectorAll("input, textarea");

        inputs.forEach((input) => {
          const name =
            input.name?.toLowerCase() ||
            input.placeholder?.toLowerCase() ||
            "";

          if (name.includes("customer") || name.includes("name")) {
            input.value = lead.customer_name || "";
          }

          if (name.includes("company")) {
            input.value = lead.company || "";
          }

          if (name.includes("industry")) {
            input.value = lead.industry || "";
          }

          if (
            name.includes("requirement") ||
            name.includes("require")
          ) {
            input.value = lead.requirement || "";
          }

          if (name.includes("email")) {
            input.value = lead.email || "";
          }

          if (name.includes("phone")) {
            input.value = lead.phone || "";
          }

          if (name.includes("assign")) {
            input.value = lead.assigned_to || "";
          }
        });
      } catch (error) {
        console.error("Lead detail error:", error);
      }
    };

    const handleLoad = () => {
      loadLead();
    };

    iframe?.addEventListener("load", handleLoad);

    return () => {
      iframe?.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Lead Detail"
      src="/stitch/lead_detail_skytech_admin/code.html"
      style={{
        width: "100%",
        height: "100vh",
        border: 0,
        display: "block",
      }}
    />
  );
}