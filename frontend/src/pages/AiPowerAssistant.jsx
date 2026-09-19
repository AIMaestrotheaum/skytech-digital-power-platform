import { useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";

export default function AiPowerAssistant() {
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
          "AI Power Assistant form not found."
        );
        return;
      }

      const submitHandler = async (event) => {
        event.preventDefault();

        /*
         * Find the question input.
         */
        const input =
          form.querySelector("textarea") ||
          form.querySelector(
            'input[type="text"]'
          ) ||
          form.querySelector(
            'input:not([type="hidden"])'
          );

        if (!input) {
          console.error(
            "AI assistant question input not found."
          );
          return;
        }

        const question =
          input.value.trim();

        if (!question) {
          alert(
            "Please enter your question."
          );
          return;
        }

        try {
          const response = await fetch(
            `${API_BASE}/api/public/ai-power-assistant`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                question,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            alert(
              data.detail ||
                "Unable to get an answer."
            );
            return;
          }

          console.log(
            "AI Power Assistant API:",
            data
          );

          /*
           * Try to display the response inside
           * the existing Stitch result area.
           */
          const main =
            doc.querySelector("main") ||
            doc.body;

          const answer =
            data.answer ||
            data.response ||
            data.message ||
            "";

          if (!answer) {
            alert(
              JSON.stringify(
                data,
                null,
                2
              )
            );
            return;
          }

          /*
           * Look for an existing answer/result
           * container.
           */
          const resultCandidates = [
            ...main.querySelectorAll(
              '[class*="answer"], [class*="response"], [class*="result"]'
            ),
          ];

          const resultElement =
            resultCandidates.find(
              (element) =>
                element.children.length === 0 ||
                element.children.length <= 1
            );

          if (resultElement) {
            resultElement.textContent =
              answer;
          } else {
            /*
             * Fallback: show the API response
             * without changing the Stitch page.
             */
            alert(answer);
          }
        } catch (error) {
          console.error(
            "AI Power Assistant Error:",
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

      iframe._aiSubmitHandler =
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
      title="SKYTECH AI Power Assistant"
      src="/stitch/ai_power_assistant_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}