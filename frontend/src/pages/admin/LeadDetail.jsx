import { useEffect, useRef } from "react";
import { apiFetch } from "../../utils/api";

export default function LeadDetail() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let isMounted = true;

    const getErrorMessage = async (response) => {
      let message =
        `Lead detail API failed: ${response.status}`;

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

    const setInputValue = (
      input,
      value
    ) => {
      if (
        value === null ||
        value === undefined
      ) {
        return;
      }

      input.value = String(value);

      /*
       * Notify Stitch/React-like controls
       * that the value has changed.
       */
      input.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );

      input.dispatchEvent(
        new Event("change", {
          bubbles: true,
        })
      );
    };

    const loadLead = async () => {
      try {
        const leadId =
          sessionStorage.getItem(
            "selected_lead_id"
          );

        if (!leadId) {
          console.warn(
            "No selected lead ID found."
          );
          return;
        }

        const response = await apiFetch(
          `/api/admin/leads/${encodeURIComponent(
            leadId
          )}`
        );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response)
          );
        }

        const lead =
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
         * Replace visible Stitch demo text
         * with real lead information.
         */
        const replacements = {
          "LD-4092":
            lead.lead_code,

          "Rohan Sharma":
            lead.customer_name,

          "ABC Industries":
            lead.company,

          "Manufacturing":
            lead.industry,

          "100kVA UPS":
            lead.requirement,

          "New":
            lead.status,
        };

        const elements =
          Array.from(
            doc.querySelectorAll("*")
          ).filter(
            (element) =>
              element.children.length === 0
          );

        elements.forEach(
          (element) => {
            const currentText =
              element.textContent?.trim();

            if (
              !currentText ||
              replacements[currentText] ===
                undefined ||
              replacements[currentText] ===
                null
            ) {
              return;
            }

            element.textContent =
              String(
                replacements[currentText]
              );
          }
        );

        /*
         * Populate editable fields when
         * matching fields exist in Stitch.
         */
        const fields =
          doc.querySelectorAll(
            "input, textarea, select"
          );

        fields.forEach((field) => {
          const name =
            (
              field.name ||
              field.id ||
              field.placeholder ||
              field.getAttribute(
                "aria-label"
              ) ||
              ""
            ).toLowerCase();

          if (
            name.includes("customer") ||
            name.includes("customer_name")
          ) {
            setInputValue(
              field,
              lead.customer_name
            );
            return;
          }

          if (
            name.includes("company")
          ) {
            setInputValue(
              field,
              lead.company
            );
            return;
          }

          if (
            name.includes("industry")
          ) {
            setInputValue(
              field,
              lead.industry
            );
            return;
          }

          if (
            name.includes("requirement") ||
            name.includes("require")
          ) {
            setInputValue(
              field,
              lead.requirement
            );
            return;
          }

          if (
            name.includes("email")
          ) {
            setInputValue(
              field,
              lead.email
            );
            return;
          }

          if (
            name.includes("phone") ||
            name.includes("mobile")
          ) {
            setInputValue(
              field,
              lead.phone
            );
            return;
          }

          if (
            name.includes("assign")
          ) {
            setInputValue(
              field,
              lead.assigned_to
            );
          }
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Lead detail error:",
          error
        );
      }
    };

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      /*
       * Give the Stitch document a moment to
       * finish rendering before modifying it.
       */
      timeoutId = window.setTimeout(() => {
        if (isMounted) {
          loadLead();
        }
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
  }, []);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Lead Detail"
        src="/stitch/lead_detail_skytech_admin/code.html"
        className="block w-full min-h-screen h-screen border-0"
      />
    </div>
  );
}