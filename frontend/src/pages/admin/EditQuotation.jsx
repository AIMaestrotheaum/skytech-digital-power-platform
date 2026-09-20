import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function EditQuotation() {
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
    let saveButtonHandlers = [];

    const getErrorMessage = async (response) => {
      let message =
        `Quotation API failed: ${response.status}`;

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

    const setFieldValue = (
      field,
      value
    ) => {
      if (
        value === null ||
        value === undefined
      ) {
        return;
      }

      field.value = String(value);

      field.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );

      field.dispatchEvent(
        new Event("change", {
          bubbles: true,
        })
      );
    };

    const replaceText = (
      doc,
      possibleTexts,
      value
    ) => {
      if (
        value === null ||
        value === undefined
      ) {
        return;
      }

      const elements =
        Array.from(
          doc.querySelectorAll("*")
        );

      const element =
        elements.find((el) => {
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

      if (element) {
        element.textContent =
          String(value);
      }
    };

    const findField = (
      doc,
      keywords
    ) => {
      const fields =
        Array.from(
          doc.querySelectorAll(
            "input, textarea, select"
          )
        );

      return fields.find((field) => {
        const identifier = (
          field.name ||
          field.id ||
          field.placeholder ||
          field.getAttribute(
            "aria-label"
          ) ||
          ""
        ).toLowerCase();

        return keywords.some(
          (keyword) =>
            identifier.includes(
              keyword
            )
        );
      });
    };

    const populateQuotation = (
      doc,
      quote
    ) => {
      /*
       * Backend currently returns:
       * id
       * quote_code
       * customer_name
       * company
       * amount
       * status
       * created_at
       */

      replaceText(
        doc,
        [
          "QT-2025-001",
          "QT-4092",
        ],
        quote.quote_code
      );

      replaceText(
        doc,
        [
          "Rohan Sharma",
          "Customer Name",
        ],
        quote.customer_name
      );

      replaceText(
        doc,
        [
          "ABC Industries",
          "Company",
        ],
        quote.company
      );

      replaceText(
        doc,
        [
          "₹50,000",
          "50000",
          "Amount",
        ],
        quote.amount
      );

      replaceText(
        doc,
        [
          "New",
          "Pending",
        ],
        quote.status
      );

      /*
       * Populate amount field.
       */
      const amountField =
        findField(doc, [
          "amount",
          "price",
          "total",
          "value",
        ]);

      if (amountField) {
        setFieldValue(
          amountField,
          quote.amount
        );
      }

      /*
       * Populate status field.
       */
      const statusField =
        findField(doc, [
          "status",
        ]);

      if (statusField) {
        setFieldValue(
          statusField,
          quote.status
        );
      }
    };

    const getFormValues = (doc) => {
      const amountField =
        findField(doc, [
          "amount",
          "price",
          "total",
          "value",
        ]);

      const statusField =
        findField(doc, [
          "status",
        ]);

      let amount =
        amountField?.value?.trim() ?? "";

      const status =
        statusField?.value?.trim() ?? "";

      if (amount !== "") {
        amount = Number(
          amount.replace(/,/g, "")
        );

        if (
          Number.isNaN(amount)
        ) {
          throw new Error(
            "Please enter a valid quotation amount."
          );
        }

        if (amount < 0) {
          throw new Error(
            "Quotation amount cannot be negative."
          );
        }
      }

      const payload = {};

      if (amount !== "") {
        payload.amount = amount;
      }

      if (status !== "") {
        payload.status = status;
      }

      if (
        Object.keys(payload).length === 0
      ) {
        throw new Error(
          "Please provide an amount or status to update."
        );
      }

      return payload;
    };

    const attachSaveHandlers = (
      doc,
      quoteId
    ) => {
      const buttons =
        Array.from(
          doc.querySelectorAll(
            "button, a"
          )
        );

      buttons.forEach((button) => {
        const text =
          button.textContent
            ?.replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

        if (
          !text ||
          (
            !text.includes("save") &&
            !text.includes("update")
          )
        ) {
          return;
        }

        const handleSave = async (
          event
        ) => {
          event.preventDefault();
          event.stopPropagation();

          if (
            button.dataset.saving ===
            "true"
          ) {
            return;
          }

          try {
            button.dataset.saving =
              "true";

            const originalText =
              button.textContent;

            button.textContent =
              "Saving...";

            const payload =
              getFormValues(doc);

            const response =
              await apiFetch(
                `/api/admin/quotes/${encodeURIComponent(
                  quoteId
                )}`,
                {
                  method: "PUT",
                  body: payload,
                }
              );

            if (!response.ok) {
              throw new Error(
                await getErrorMessage(
                  response
                )
              );
            }

            const data =
              await response.json();

            if (!isMounted) {
              return;
            }

            const updatedQuote =
              data?.quote;

            if (updatedQuote) {
              populateQuotation(
                doc,
                updatedQuote
              );
            }

            button.textContent =
              "Saved";

            window.setTimeout(() => {
              if (
                button.isConnected
              ) {
                button.textContent =
                  originalText ||
                  "Save";
              }
            }, 1500);
          } catch (error) {
            console.error(
              "Quote update error:",
              error
            );

            window.alert(
              error.message ||
                "Unable to update quotation."
            );

            button.textContent =
              "Save";
          } finally {
            button.dataset.saving =
              "false";
          }
        };

        button.addEventListener(
          "click",
          handleSave
        );

        saveButtonHandlers.push({
          button,
          handleSave,
        });
      });
    };

    const loadQuotation = async () => {
      try {
        const quoteId =
          sessionStorage.getItem(
            "selected_quote_id"
          );

        if (!quoteId) {
          console.warn(
            "No selected quotation ID found."
          );

          navigate(
            "/admin/quotes",
            { replace: true }
          );

          return;
        }

        const response =
          await apiFetch(
            `/api/admin/quotes/${encodeURIComponent(
              quoteId
            )}`
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        const data =
          await response.json();

        if (!isMounted) {
          return;
        }

        const quote =
          data?.quote || data;

        iframeDocument =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!iframeDocument) {
          return;
        }

        populateQuotation(
          iframeDocument,
          quote
        );

        attachSaveHandlers(
          iframeDocument,
          quoteId
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Edit Quotation Error:",
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

      timeoutId =
        window.setTimeout(() => {
          if (isMounted) {
            loadQuotation();
          }
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

      saveButtonHandlers.forEach(
        ({
          button,
          handleSave,
        }) => {
          button.removeEventListener(
            "click",
            handleSave
          );
        }
      );

      saveButtonHandlers = [];
      iframeDocument = null;
    };
  }, [navigate]);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Edit Quotation"
        src="/stitch/edit_quotation_skytech_admin/code.html"
        className="block w-full min-h-screen h-screen border-0"
      />
    </div>
  );
}