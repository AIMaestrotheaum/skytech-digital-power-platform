import { useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";

export default function ServiceRequestAmcEnquiry() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let iframeDocument = null;
    let isMounted = true;

    let form = null;
    let submitButton = null;
    let submitHandler = null;

    const getApiError = async (response) => {
      let message =
        `Request failed with status ${response.status}.`;

      try {
        const data = await response.json();

        if (typeof data?.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data?.detail)) {
          message = data.detail
            .map(
              (item) =>
                item?.msg ||
                "Validation error"
            )
            .join(", ");
        }
      } catch {
        // Keep default message.
      }

      return message;
    };

    const findInput = (doc, keywords) => {
      const elements = Array.from(
        doc.querySelectorAll(
          "input, textarea, select"
        )
      );

      return (
        elements.find((element) => {
          const text =
            `${element.getAttribute("name") || ""} ${
              element.getAttribute("id") || ""
            } ${
              element.getAttribute("placeholder") || ""
            } ${
              element.getAttribute("aria-label") || ""
            }`.toLowerCase();

          return keywords.some((keyword) =>
            text.includes(keyword)
          );
        }) || null
      );
    };

    const getFieldValue = (doc, keywords) => {
      const element = findInput(
        doc,
        keywords
      );

      if (!element) {
        return "";
      }

      return String(element.value || "").trim();
    };

    const setFormMessage = (
      doc,
      message,
      success = false
    ) => {
      let messageElement =
        doc.getElementById(
          "skytech-amc-form-message"
        );

      if (!messageElement) {
        messageElement =
          doc.createElement("div");

        messageElement.id =
          "skytech-amc-form-message";

        messageElement.style.cssText = `
          margin: 16px 0;
          padding: 12px 16px;
          border-radius: 8px;
          font-family: Inter, Arial, sans-serif;
          font-size: 14px;
          line-height: 1.5;
        `;

        if (form) {
          form.insertBefore(
            messageElement,
            form.firstChild
          );
        } else {
          doc.body.prepend(
            messageElement
          );
        }
      }

      messageElement.textContent =
        message;

      messageElement.style.background =
        success
          ? "#ecfdf5"
          : "#fef2f2";

      messageElement.style.color =
        success
          ? "#047857"
          : "#b91c1c";

      messageElement.style.border =
        success
          ? "1px solid #a7f3d0"
          : "1px solid #fecaca";
    };

    const submitRequest = async () => {
      if (!form || !isMounted) {
        return;
      }

      const customerName =
        getFieldValue(doc, [
          "customer_name",
          "customer-name",
          "name",
          "full name",
          "customer",
        ]);

      const company =
        getFieldValue(doc, [
          "company",
          "company_name",
          "company-name",
          "organization",
        ]);

      const issue =
        getFieldValue(doc, [
          "issue",
          "problem",
          "message",
          "description",
          "requirement",
          "request",
        ]);

      const priority =
        getFieldValue(doc, [
          "priority",
        ]) || "normal";

      if (!customerName) {
        setFormMessage(
          doc,
          "Please enter your name."
        );
        return;
      }

      if (!issue) {
        setFormMessage(
          doc,
          "Please describe your service or AMC requirement."
        );
        return;
      }

      const normalizedPriority =
        priority.toLowerCase();

      const allowedPriorities = [
        "low",
        "normal",
        "high",
        "critical",
      ];

      const finalPriority =
        allowedPriorities.includes(
          normalizedPriority
        )
          ? normalizedPriority
          : "normal";

      const payload = {
        customer_name:
          customerName,
        company:
          company || null,
        issue,
        priority:
          finalPriority,
      };

      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.dataset.originalText =
            submitButton.textContent;

          submitButton.textContent =
            "Submitting...";
        }

        setFormMessage(
          doc,
          "Submitting your request..."
        );

        const response =
          await apiFetch(
            "/api/public/amc-request",
            {
              method: "POST",
              body: payload,
            }
          );

        if (!response.ok) {
          throw new Error(
            await getApiError(response)
          );
        }

        const data =
          await response.json();

        if (!isMounted) {
          return;
        }

        const requestCode =
          data?.request_code ||
          data?.service_request_code ||
          "";

        setFormMessage(
          doc,
          requestCode
            ? `Request submitted successfully. Your request number is ${requestCode}.`
            : "Your service request has been submitted successfully.",
          true
        );

        form.reset?.();
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Public AMC request error:",
          error
        );

        setFormMessage(
          doc,
          error.message ||
            "Unable to submit your request. Please try again."
        );
      } finally {
        if (
          isMounted &&
          submitButton
        ) {
          submitButton.disabled = false;

          submitButton.textContent =
            submitButton.dataset
              .originalText ||
            "Submit";
        }
      }
    };

    const setupPage = () => {
      const doc =
        iframe.contentDocument ||
        iframe.contentWindow?.document;

      if (!doc) {
        return;
      }

      iframeDocument = doc;

      form =
        doc.querySelector("form");

      if (!form) {
        console.warn(
          "Public AMC request form was not found in Stitch page."
        );
        return;
      }

      submitButton =
        Array.from(
          form.querySelectorAll(
            "button, input[type='submit']"
          )
        ).find((button) => {
          const text =
            `${button.textContent || ""} ${
              button.value || ""
            }`.toLowerCase();

          return (
            text.includes("submit") ||
            text.includes("request") ||
            text.includes("send")
          );
        }) || null;

      submitHandler = (event) => {
        event.preventDefault();
        event.stopPropagation();

        submitRequest();
      };

      form.addEventListener(
        "submit",
        submitHandler
      );
    };

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        if (isMounted) {
          setupPage();
        }
      }, 300);
    };

    iframe.addEventListener(
      "load",
      handleLoad
    );

    if (
      iframe.contentDocument
        ?.readyState === "complete"
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

      if (
        form &&
        submitHandler
      ) {
        form.removeEventListener(
          "submit",
          submitHandler
        );
      }

      iframeDocument = null;
      form = null;
      submitButton = null;
      submitHandler = null;
    };
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-64px)] overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Service and AMC Request"
        src="/stitch/support_amc_requests_skytech/code.html"
        className="block w-full min-h-[calc(100vh-64px)] border-0"
        style={{
          height: "calc(100vh - 64px)",
        }}
      />
    </div>
  );
}