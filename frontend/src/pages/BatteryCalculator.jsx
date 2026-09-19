import { useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function BatteryCalculator() {
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
          "Battery calculator form not found."
        );
        return;
      }

      const submitHandler = async (event) => {
        event.preventDefault();

        const inputs = Array.from(
          form.querySelectorAll("input")
        );

        let loadKw = null;
        let backupMinutes = null;
        let batteryVoltage = 12;
        let batteryAh = 100;
        let efficiency = 0.9;
        let depthOfDischarge = 0.8;

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
            name.includes("backup") ||
            name.includes("minute") ||
            name.includes("time")
          ) {
            backupMinutes = value;
          } else if (
            name.includes("voltage") ||
            name.includes("volt")
          ) {
            batteryVoltage = value;
          } else if (
            name.includes("ah") ||
            name.includes("amp")
          ) {
            batteryAh = value;
          } else if (
            name.includes("efficiency") ||
            name.includes("eff")
          ) {
            efficiency = value;
          } else if (
            name.includes("depth") ||
            name.includes("dod")
          ) {
            depthOfDischarge = value;
          }
        });

        /*
         * Fallback:
         * first numeric input = load
         * second numeric input = backup time
         */
        const numericInputs = inputs.filter(
          (input) =>
            !Number.isNaN(
              parseFloat(input.value)
            )
        );

        if (loadKw === null && numericInputs[0]) {
          loadKw = parseFloat(
            numericInputs[0].value
          );
        }

        if (
          backupMinutes === null &&
          numericInputs[1]
        ) {
          backupMinutes = parseFloat(
            numericInputs[1].value
          );
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

        if (
          backupMinutes === null ||
          backupMinutes <= 0
        ) {
          alert(
            "Please enter a valid backup time."
          );
          return;
        }

        try {
          const response = await fetch(
            `${API_BASE}/api/public/battery-calculator`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                load_kw: loadKw,
                backup_minutes:
                  backupMinutes,
                battery_voltage:
                  batteryVoltage,
                battery_ah: batteryAh,
                efficiency: efficiency,
                depth_of_discharge:
                  depthOfDischarge,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            alert(
              data.detail ||
                "Unable to calculate battery requirement."
            );
            return;
          }

          console.log(
            "Battery Calculator API:",
            data
          );

          const resultText =
            Object.entries(data)
              .map(
                ([key, value]) =>
                  `${key}: ${value}`
              )
              .join("\n");

          alert(
            `Battery Calculation Result\n\n${resultText}`
          );
        } catch (error) {
          console.error(
            "Battery Calculator Error:",
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

      iframe._batterySubmitHandler =
        submitHandler;
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
      title="SKYTECH Battery Calculator"
      src="/stitch/battery_calculator_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}