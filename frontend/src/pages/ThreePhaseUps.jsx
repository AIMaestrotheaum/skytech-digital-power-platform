import { useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function ThreePhaseUps() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const handleLoad = () => {
      const doc = iframe.contentDocument;

      if (!doc) return;

      const form = doc.querySelector("form");

      if (!form) {
        console.warn(
          "Three-phase UPS calculator form not found."
        );
        return;
      }

      const submitHandler = async (event) => {
        event.preventDefault();

        const inputs = Array.from(
          form.querySelectorAll("input")
        );

        let loadKw = null;
        let powerFactor = 0.8;
        let safetyMargin = 1.25;
        let voltage = 415;

        inputs.forEach((input) => {
          const name =
            input.name?.toLowerCase() ||
            input.id?.toLowerCase() ||
            input.placeholder?.toLowerCase() ||
            "";

          const value = parseFloat(input.value);

          if (Number.isNaN(value)) {
            return;
          }

          if (
            name.includes("load") ||
            name.includes("kw")
          ) {
            loadKw = value;
          } else if (
            name.includes("power") ||
            name.includes("factor") ||
            name.includes("pf")
          ) {
            powerFactor = value;
          } else if (
            name.includes("margin") ||
            name.includes("safety")
          ) {
            safetyMargin = value;
          } else if (
            name.includes("voltage") ||
            name.includes("volt")
          ) {
            voltage = value;
          }
        });

        /*
         * Fallback:
         * first numeric input = load
         */
        if (loadKw === null) {
          const firstNumeric =
            inputs.find(
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
            `${API_BASE}/api/public/three-phase-ups`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                load_kw: loadKw,
                power_factor:
                  powerFactor,
                safety_margin:
                  safetyMargin,
                voltage: voltage,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            alert(
              data.detail ||
                "Unable to calculate three-phase UPS requirement."
            );
            return;
          }

          console.log(
            "Three-Phase UPS API:",
            data
          );

          /*
           * Display the real API result.
           */
          const resultText =
            Object.entries(data)
              .map(
                ([key, value]) =>
                  `${key}: ${value}`
              )
              .join("\n");

          alert(
            `Three-Phase UPS Calculation Result\n\n${resultText}`
          );
        } catch (error) {
          console.error(
            "Three-Phase UPS Calculator Error:",
            error
          );

          alert(
            "Unable to connect to SKYTECH server."
          );
        }
      };

      form.addEventListener(
        "submit",
        submitHandler
      );
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
      title="SKYTECH Three-Phase UPS Calculator"
      src="/stitch/three_phase_ups_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}