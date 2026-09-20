import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function LeadManagement() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let isMounted = true;

    const getErrorMessage = async (response) => {
      let message =
        `Leads API failed: ${response.status}`;

      try {
        const errorData =
          await response.json();

        if (errorData?.detail) {
          message =
            typeof errorData.detail === "string"
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

    const createCell = (doc, value) => {
      const cell = doc.createElement("td");

      cell.textContent =
        value === null ||
        value === undefined ||
        value === ""
          ? "-"
          : String(value);

      return cell;
    };

    const formatDate = (value) => {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

      return date.toLocaleDateString(
        "en-IN"
      );
    };

    const loadLeads = async () => {
      try {
        const response = await apiFetch(
          "/api/admin/leads"
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

        /*
         * API may return:
         *
         * [...]
         *
         * or:
         *
         * { leads: [...] }
         */
        const leads = Array.isArray(data)
          ? data
          : Array.isArray(data?.leads)
          ? data.leads
          : [];

        /*
         * Find the Stitch lead table.
         */
        const table =
          doc.querySelector("table");

        if (!table) {
          console.warn(
            "Lead table not found in Stitch page."
          );
          return;
        }

        const tbody =
          table.querySelector("tbody");

        if (!tbody) {
          console.warn(
            "Lead table body not found."
          );
          return;
        }

        /*
         * Clear existing demo rows.
         */
        tbody.innerHTML = "";

        /*
         * Render API leads.
         */
        leads.forEach((lead) => {
          const row =
            doc.createElement("tr");

          row.appendChild(
            createCell(
              doc,
              lead.lead_code
            )
          );

          row.appendChild(
            createCell(
              doc,
              lead.customer_name
            )
          );

          row.appendChild(
            createCell(
              doc,
              lead.company
            )
          );

          row.appendChild(
            createCell(
              doc,
              lead.industry
            )
          );

          row.appendChild(
            createCell(
              doc,
              lead.requirement
            )
          );

          row.appendChild(
            createCell(
              doc,
              lead.status
            )
          );

          row.appendChild(
            createCell(
              doc,
              lead.assigned_to
            )
          );

          row.appendChild(
            createCell(
              doc,
              formatDate(
                lead.created_at
              )
            )
          );

          /*
           * Make the complete row clickable.
           */
          row.style.cursor = "pointer";

          row.addEventListener(
            "click",
            () => {
              if (
                lead.id === undefined ||
                lead.id === null
              ) {
                return;
              }

              sessionStorage.setItem(
                "selected_lead_id",
                String(lead.id)
              );

              /*
               * IMPORTANT:
               * AppRoutes uses /admin/leads/:id
               */
              navigate(
                `/admin/leads/${lead.id}`
              );
            }
          );

          tbody.appendChild(row);
        });

        /*
         * Update common Stitch lead count.
         */
        const countElements =
          Array.from(
            doc.querySelectorAll("*")
          ).filter((el) => {
            if (el.children.length !== 0) {
              return false;
            }

            const text =
              el.textContent?.trim();

            return (
              text === "24" ||
              text === "Total Leads"
            );
          });

        countElements.forEach((el) => {
          if (
            el.textContent?.trim() ===
            "24"
          ) {
            el.textContent =
              String(leads.length);
          }
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Lead Management Error:",
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

        loadLeads();
      }, 300);
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    /*
     * Handle an iframe that is already loaded.
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
  }, [navigate]);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Lead Management"
        src="/stitch/lead_management_skytech_admin/code.html"
        className="block w-full min-h-screen h-screen border-0"
      />
    </div>
  );
}