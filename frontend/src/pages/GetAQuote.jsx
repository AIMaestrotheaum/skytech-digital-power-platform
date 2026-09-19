import { useEffect, useRef } from "react";

export default function GetAQuote() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    let form = null;
    let submitHandler = null;

    const findField = (doc, keywords) => {
      const fields = Array.from(
        doc.querySelectorAll(
          "input, textarea, select"
        )
      );

      return (
        fields.find((field) => {
          const name =
            field
              .getAttribute("name")
              ?.toLowerCase() || "";

          const id =
            field
              .getAttribute("id")
              ?.toLowerCase() || "";

          const placeholder =
            field
              .getAttribute("placeholder")
              ?.toLowerCase() || "";

          const aria =
            field
              .getAttribute("aria-label")
              ?.toLowerCase() || "";

          const combined =
            `${name} ${id} ${placeholder} ${aria}`;

          return keywords.some((keyword) =>
            combined.includes(keyword)
          );
        }) || null
      );
    };

    const showMessage = (
      doc,
      message,
      success = true
    ) => {
      let messageBox =
        doc.querySelector(
          ".skytech-form-message"
        );

      if (!messageBox) {
        messageBox =
          doc.createElement("div");

        messageBox.className =
          "skytech-form-message";

        messageBox.style.marginTop =
          "16px";

        messageBox.style.padding =
          "12px 16px";

        messageBox.style.borderRadius =
          "8px";

        messageBox.style.fontSize =
          "14px";

        messageBox.style.fontWeight =
          "600";

        if (form) {
          form.appendChild(
            messageBox
          );
        }
      }

      messageBox.textContent =
        message;

      messageBox.style.background =
        success
          ? "#e8f5e9"
          : "#ffebee";

      messageBox.style.color =
        success
          ? "#1b5e20"
          : "#b71c1c";
    };

    const handleSubmit = async (
      event,
      doc
    ) => {
      event.preventDefault();

      const submitButton =
        form.querySelector(
          "button[type='submit'], input[type='submit']"
        );

      const customerNameField =
        findField(doc, [
          "customer name",
          "full name",
          "name",
        ]);

      const companyField =
        findField(doc, [
          "company",
          "company name",
          "organization",
        ]);

      const emailField =
        findField(doc, [
          "email",
          "email address",
        ]);

      const phoneField =
        findField(doc, [
          "phone",
          "mobile",
          "contact number",
        ]);

      const industryField =
        findField(doc, [
          "industry",
        ]);

      const requirementField =
        findField(doc, [
          "requirement",
          "message",
          "description",
          "details",
        ]);

      const customerName =
        customerNameField?.value?.trim() ||
        "";

      const company =
        companyField?.value?.trim() ||
        "";

      const email =
        emailField?.value?.trim() ||
        "";

      const phone =
        phoneField?.value?.trim() ||
        "";

      const industry =
        industryField?.value?.trim() ||
        "";

      const requirement =
        requirementField?.value?.trim() ||
        "";

      if (
        !customerName ||
        !email ||
        !requirement
      ) {
        showMessage(
          doc,
          "Please fill all required fields.",
          false
        );

        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.opacity =
          "0.6";
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/public/quote",
          {
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

              email,

              phone:
                phone || null,

              industry:
                industry || null,

              requirement,

              source:
                "website",
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "Unable to submit quote request."
          );
        }

        console.log(
          "Quote Request API:",
          data
        );

        showMessage(
          doc,
          `Quote request submitted successfully. Reference: ${data.lead_code}`,
          true
        );

        form.reset();
      } catch (error) {
        console.error(
          "Get Quote Error:",
          error
        );

        showMessage(
          doc,
          error.message ||
            "Something went wrong. Please try again.",
          false
        );
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.style.opacity =
            "1";
        }
      }
    };

    const setupPage = () => {
      const doc =
        iframe.contentDocument;

      if (!doc) return;

      /*
       * Find the main form.
       */
      const forms = Array.from(
        doc.querySelectorAll("form")
      );

      form =
        forms.find((candidate) => {
          const text =
            candidate.textContent
              ?.toLowerCase() || "";

          return (
            text.includes("quote") ||
            text.includes("requirement")
          );
        }) ||
        forms[0] ||
        null;

      if (!form) {
        console.error(
          "Get Quote form not found."
        );
        return;
      }

      console.log(
        "Get Quote form connected."
      );

      submitHandler = (event) => {
        handleSubmit(
          event,
          doc
        );
      };

      form.addEventListener(
        "submit",
        submitHandler
      );
    };

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

    if (
      iframe.contentDocument
        ?.readyState ===
      "complete"
    ) {
      handleLoad();
    }

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

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Get a Quote"
      src="/stitch/get_a_quote_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}