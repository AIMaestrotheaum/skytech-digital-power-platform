import { useEffect, useRef } from "react";

export default function ContactUs() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const API_URL =
      "http://127.0.0.1:8000/api/public/contact";

    let form = null;
    let submitHandler = null;

    /*
     * ---------------------------------------------------------
     * GET FIELD BY LABEL / ATTRIBUTE
     * ---------------------------------------------------------
     */
    const findInputByKeywords = (
      doc,
      keywords
    ) => {
      const inputs = Array.from(
        doc.querySelectorAll(
          "input, textarea, select"
        )
      );

      return (
        inputs.find((element) => {
          const name =
            element
              .getAttribute("name")
              ?.toLowerCase() || "";

          const id =
            element
              .getAttribute("id")
              ?.toLowerCase() || "";

          const placeholder =
            element
              .getAttribute("placeholder")
              ?.toLowerCase() || "";

          const aria =
            element
              .getAttribute("aria-label")
              ?.toLowerCase() || "";

          const combined =
            `${name} ${id} ${placeholder} ${aria}`;

          return keywords.some((keyword) =>
            combined.includes(
              keyword.toLowerCase()
            )
          );
        }) || null
      );
    };

    /*
     * ---------------------------------------------------------
     * FIND CONTACT FORM
     * ---------------------------------------------------------
     */
    const setupPage = () => {
      const doc = iframe.contentDocument;

      if (!doc) {
        console.error(
          "Contact iframe document not available."
        );
        return;
      }

      /*
       * Find form.
       */
      form = doc.querySelector("form");

      if (!form) {
        console.error(
          "SKYTECH Contact form was not found."
        );
        return;
      }

      console.log(
        "SKYTECH Contact form connected."
      );

      /*
       * -------------------------------------------------------
       * FIND FIELDS
       * -------------------------------------------------------
       */

      const nameInput =
        findInputByKeywords(
          doc,
          [
            "full name",
            "fullname",
            "customer_name",
            "customer name",
          ]
        ) ||
        form.querySelector(
          "input[type='text']"
        );

      const companyInput =
        findInputByKeywords(
          doc,
          [
            "company",
            "company_name",
            "organization",
          ]
        );

      const requirementSelect =
        findInputByKeywords(
          doc,
          [
            "requirement",
            "primary requirement",
          ]
        ) ||
        form.querySelector(
          "select"
        );

      const projectDetailsInput =
        findInputByKeywords(
          doc,
          [
            "project details",
            "project_detail",
            "message",
            "details",
          ]
        ) ||
        form.querySelector(
          "textarea"
        );

      /*
       * Log detected fields.
       */
      console.log(
        "Contact form fields:",
        {
          nameInput,
          companyInput,
          requirementSelect,
          projectDetailsInput,
        }
      );

      /*
       * -------------------------------------------------------
       * SUBMIT HANDLER
       * -------------------------------------------------------
       */
      submitHandler = async (event) => {
        event.preventDefault();

        /*
         * Read values.
         */
        const customerName =
          nameInput?.value?.trim() || "";

        const company =
          companyInput?.value?.trim() || "";

        const requirement =
          requirementSelect?.value?.trim() || "";

        const message =
          projectDetailsInput
            ?.value
            ?.trim() || "";

        console.log(
          "Contact form submitted:",
          {
            customerName,
            company,
            requirement,
            message,
          }
        );

        /*
         * -----------------------------------------------------
         * VALIDATION
         * -----------------------------------------------------
         */

        if (!customerName) {
          alert(
            "Please enter your full name."
          );
          return;
        }

        if (!requirement) {
          alert(
            "Please select your primary requirement."
          );
          return;
        }

        if (
          requirement.toLowerCase() ===
            "select" ||
          requirement.toLowerCase() ===
            "select requirement"
        ) {
          alert(
            "Please select your primary requirement."
          );
          return;
        }

        if (!message) {
          alert(
            "Please enter your project details."
          );
          return;
        }

        /*
         * -----------------------------------------------------
         * SUBMIT BUTTON
         * -----------------------------------------------------
         */

        const submitButton =
          form.querySelector(
            "button[type='submit'], input[type='submit']"
          );

        const originalButtonText =
          submitButton?.textContent || "";

        if (submitButton) {
          submitButton.disabled = true;

          if (
            submitButton.tagName ===
            "BUTTON"
          ) {
            submitButton.textContent =
              "Submitting...";
          }
        }

        /*
         * -----------------------------------------------------
         * API REQUEST
         * -----------------------------------------------------
         */

        try {
          const response =
            await fetch(API_URL, {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                customer_name:
                  customerName,

                company:
                  company || null,

                /*
                 * Contact page does not collect
                 * email or phone.
                 */
                email: null,

                phone: null,

                requirement:
                  requirement,

                message:
                  message,
              }),
            });

          /*
           * Read response safely.
           */
          let data = null;

          try {
            data =
              await response.json();
          } catch {
            data = null;
          }

          console.log(
            "Contact API status:",
            response.status
          );

          console.log(
            "Contact API response:",
            data
          );

          /*
           * ---------------------------------------------------
           * HANDLE API ERROR
           * ---------------------------------------------------
           */

          if (!response.ok) {
            let errorMessage =
              "Unable to submit your request.";

            /*
             * FastAPI validation errors:
             *
             * detail: [
             *   {
             *     loc: [...],
             *     msg: "...",
             *     type: "..."
             *   }
             * ]
             */
            if (
              Array.isArray(
                data?.detail
              )
            ) {
              errorMessage =
                data.detail
                  .map((error) => {
                    const location =
                      Array.isArray(
                        error?.loc
                      )
                        ? error.loc
                            .filter(
                              Boolean
                            )
                            .join(".")
                        : "field";

                    const message =
                      error?.msg ||
                      "Invalid value";

                    return `${location}: ${message}`;
                  })
                  .join("\n");
            }

            /*
             * Normal FastAPI:
             *
             * detail: "some message"
             */
            else if (
              typeof data?.detail ===
              "string"
            ) {
              errorMessage =
                data.detail;
            }

            /*
             * Object error.
             */
            else if (
              data?.detail &&
              typeof data.detail ===
                "object"
            ) {
              errorMessage =
                data.detail.msg ||
                JSON.stringify(
                  data.detail,
                  null,
                  2
                );
            }

            /*
             * Other API error.
             */
            else if (
              data?.message
            ) {
              errorMessage =
                data.message;
            }

            console.error(
              "Contact API Error:",
              {
                status:
                  response.status,
                data,
                errorMessage,
              }
            );

            throw new Error(
              errorMessage
            );
          }

          /*
           * ---------------------------------------------------
           * SUCCESS
           * ---------------------------------------------------
           */

          const leadCode =
            data?.lead_code ||
            data?.lead?.lead_code ||
            "Generated";

          alert(
            `Request submitted successfully!\n\nLead Code: ${leadCode}`
          );

          /*
           * Reset Stitch form.
           */
          form.reset();

          console.log(
            "Contact enquiry submitted successfully:",
            data
          );
        } catch (error) {
          /*
           * ---------------------------------------------------
           * FINAL ERROR HANDLING
           * ---------------------------------------------------
           */

          console.error(
            "Contact submission failed:",
            error
          );

          alert(
            `Request failed.\n\n${
              error?.message ||
              "Something went wrong. Please try again."
            }`
          );
        } finally {
          /*
           * ---------------------------------------------------
           * RESTORE BUTTON
           * ---------------------------------------------------
           */

          if (submitButton) {
            submitButton.disabled = false;

            if (
              submitButton.tagName ===
              "BUTTON"
            ) {
              submitButton.textContent =
                originalButtonText ||
                "Submit Request";
            }
          }
        }
      };

      /*
       * Attach submit listener.
       */
      form.addEventListener(
        "submit",
        submitHandler
      );
    };

    /*
     * ---------------------------------------------------------
     * IFRAME LOAD
     * ---------------------------------------------------------
     */
    const handleLoad = () => {
      setTimeout(
        setupPage,
        300
      );
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    /*
     * If already loaded.
     */
    if (
      iframe.contentDocument
        ?.readyState ===
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
      iframe.removeEventListener(
        "load",
        handleLoad
      );

      if (
        form &&
        submitHandler
      ) {
        form.removeEventListener(
          "submit",
          submitHandler
        );
      }
    };
  }, []);

  /*
   * -----------------------------------------------------------
   * STITCH PAGE
   * -----------------------------------------------------------
   */

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Contact Us"
      src="/stitch/contact_us_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}