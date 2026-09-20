import { useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";

export default function PublicAmcRequest() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let iframeDocument = null;
    let form = null;
    let submitHandler = null;
    let timeoutId = null;
    let isMounted = true;

    const getValue = (formData, names) => {
      for (const name of names) {
        const value = formData.get(name);

        if (
          typeof value === "string" &&
          value.trim()
        ) {
          return value.trim();
        }
      }

      return "";
    };

    const normalizePriority = (value) => {
      const priority = String(value || "")
        .trim()
        .toLowerCase();

      const allowed = [
        "low",
        "normal",
        "high",
        "critical",
      ];

      return allowed.includes(priority)
        ? priority
        : "normal";
    };

    const cleanupForm = () => {
      if (form && submitHandler) {
        form.removeEventListener(
          "submit",
          submitHandler
        );
      }

      form = null;
      submitHandler = null;
    };

    const handleLoad = () => {
      if (!isMounted) {
        return;
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        try {
          iframeDocument =
            iframe.contentDocument ||
            iframe.contentWindow?.document;

          if (!iframeDocument) {
            return;
          }

          cleanupForm();

          form =
            iframeDocument.querySelector("form");

          if (!form) {
            console.warn(
              "SKYTECH AMC Request: form not found."
            );
            return;
          }

          submitHandler = async (event) => {
            event.preventDefault();

            if (!isMounted) {
              return;
            }

            const formData =
              new FormData(form);

            const customerName = getValue(
              formData,
              ["customer_name", "name"]
            );

            const company = getValue(
              formData,
              ["company", "company_name"]
            );

            const email = getValue(
              formData,
              ["email", "customer_email"]
            );

            const phone = getValue(
              formData,
              [
                "phone",
                "mobile",
                "phone_number",
              ]
            );

            const issue = getValue(
              formData,
              [
                "issue",
                "message",
                "description",
                "problem",
                "requirement",
              ]
            );

            const requestType = getValue(
              formData,
              [
                "req_type",
                "request_type",
                "type",
              ]
            );

            const priority =
              normalizePriority(
                getValue(formData, [
                  "priority",
                ])
              );

            const showAlert = (message) => {
              iframe.contentWindow?.alert(
                message
              );
            };

            if (!customerName) {
              showAlert(
                "Please enter your name."
              );
              return;
            }

            const emailPattern =
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email) {
              showAlert(
                "Please enter your email address."
              );
              return;
            }

            if (!emailPattern.test(email)) {
              showAlert(
                "Please enter a valid email address."
              );
              return;
            }

            if (!issue) {
              showAlert(
                requestType
                  .toLowerCase() === "amc"
                  ? "Please describe your AMC requirement."
                  : "Please describe your issue."
              );
              return;
            }

            if (issue.length < 5) {
              showAlert(
                "Please provide more details about your request."
              );
              return;
            }

            const submitButton =
              form.querySelector(
                'button[type="submit"], input[type="submit"]'
              );

            const originalButtonText =
              submitButton?.tagName ===
              "INPUT"
                ? submitButton.value
                : submitButton?.textContent;

            try {
              if (submitButton) {
                submitButton.disabled = true;
                submitButton.style.opacity =
                  "0.6";
                submitButton.style.cursor =
                  "not-allowed";

                if (
                  submitButton.tagName ===
                  "BUTTON"
                ) {
                  submitButton.textContent =
                    "Submitting...";
                }

                if (
                  submitButton.tagName ===
                  "INPUT"
                ) {
                  submitButton.value =
                    "Submitting...";
                }
              }

              const response =
                await apiFetch(
                  "/api/public/amc-request",
                  {
                    method: "POST",
                    body: {
                      customer_name:
                        customerName,
                      company:
                        company || null,
                      email,
                      phone:
                        phone || null,
                      issue,
                      priority,
                    },
                  }
                );

              let data = {};

              try {
                data =
                  await response.json();
              } catch {
                data = {};
              }

              if (!response.ok) {
                let errorMessage =
                  "Unable to submit your request.";

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
                                .filter(Boolean)
                                .join(".")
                            : "field";

                        return `${location}: ${
                          error?.msg ||
                          "Invalid value"
                        }`;
                      })
                      .join("\n");
                } else if (
                  typeof data?.detail ===
                  "string"
                ) {
                  errorMessage =
                    data.detail;
                } else if (
                  data?.message
                ) {
                  errorMessage =
                    data.message;
                }

                throw new Error(
                  errorMessage
                );
              }

              if (!isMounted) {
                return;
              }

              showAlert(
                data?.message ||
                  "Support request submitted successfully."
              );

              form.reset();
            } catch (error) {
              console.error(
                "SKYTECH AMC request submission failed:",
                error
              );

              if (isMounted) {
                showAlert(
                  error?.message ||
                    "Something went wrong while submitting your request. Please try again."
                );
              }
            } finally {
              if (submitButton) {
                submitButton.disabled =
                  false;
                submitButton.style.opacity =
                  "1";
                submitButton.style.cursor =
                  "";

                if (
                  submitButton.tagName ===
                  "BUTTON"
                ) {
                  submitButton.textContent =
                    originalButtonText ||
                    "Submit Request";
                }

                if (
                  submitButton.tagName ===
                  "INPUT"
                ) {
                  submitButton.value =
                    originalButtonText ||
                    "Submit Request";
                }
              }
            }
          };

          form.addEventListener(
            "submit",
            submitHandler
          );
        } catch (error) {
          console.error(
            "Could not initialize SKYTECH AMC request form:",
            error
          );
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
        window.clearTimeout(timeoutId);
      }

      cleanupForm();

      iframeDocument = null;
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <iframe
        ref={iframeRef}
        src="/stitch/support_amc_requests_skytech/code.html"
        title="SKYTECH Service Request and AMC Enquiry"
        style={{
          width: "100%",
          height: "100vh",
          minHeight: "700px",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
}