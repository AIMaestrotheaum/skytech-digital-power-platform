import { useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function UpsCalculator() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;

      if (!doc) return;

      const form = doc.querySelector("form");

      if (!form) {
        console.warn("UPS calculator form not found.");
        return;
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const inputs = form.querySelectorAll("input");

        /*
         * Find values from the calculator inputs.
         */
        let loadKw = null;
        let powerFactor = 0.8;
        let safetyMargin = 1.25;

        inputs.forEach((input) => {
          const name =
            input.name?.toLowerCase() ||
            input.id?.toLowerCase() ||
            input.placeholder?.toLowerCase() ||
            "";

          const value = parseFloat(input.value);

          if (
            name.includes("load") ||
            name.includes("kw")
          ) {
            if (!Number.isNaN(value)) {
              loadKw = value;
            }
          }

          if (
            name.includes("power") ||
            name.includes("factor") ||
            name.includes("pf")
          ) {
            if (!Number.isNaN(value)) {
              powerFactor = value;
            }
          }

          if (
            name.includes("margin") ||
            name.includes("safety")
          ) {
            if (!Number.isNaN(value)) {
              safetyMargin = value;
            }
          }
        });

        /*
         * Fallback: use first numeric input
         * as load kW.
         */
        if (loadKw === null) {
          const firstNumeric =
            Array.from(inputs).find(
              (input) =>
                !Number.isNaN(
                  parseFloat(input.value)
                )
            );

          if (firstNumeric) {
            loadKw = parseFloat(
              firstNumeric.value
            );
          }
        }

        if (
          loadKw === null ||
          loadKw <= 0
        ) {
          alert(
            "Please enter a valid load in kW."
          );
          return;
        }

        try {
          const response = await fetch(
            `${API_BASE}/api/public/ups-calculator`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                load_kw: loadKw,
                power_factor: powerFactor,
                safety_margin: safetyMargin,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            alert(
              data.detail ||
                "Unable to calculate UPS requirement."
            );
            return;
          }

          console.log(
            "UPS Calculator API:",
            data
          );

          /*
           * Display API result.
           */
          const resultText =
            Object.entries(data)
              .map(
                ([key, value]) =>
                  `${key}: ${value}`
              )
              .join("\n");

          alert(
            `UPS Calculation Result\n\n${resultText}`
          );
        } catch (error) {
          console.error(
            "UPS Calculator Error:",
            error
          );

          alert(
            "Unable to connect to SKYTECH server."
          );
        }
      });
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
      iframe.removeEventListener(
        "load",
        handleLoad
      );
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH UPS Calculator"
      src="/stitch/ups_calculator_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}