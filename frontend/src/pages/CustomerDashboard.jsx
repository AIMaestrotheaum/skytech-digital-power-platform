import { useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";

export default function CustomerDashboard() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const replaceText = (doc, possibleTexts, newValue) => {
      const elements = Array.from(doc.querySelectorAll("*"));

      const element = elements.find((el) => {
        if (el.children.length !== 0) {
          return false;
        }

        const text = el.textContent.trim();

        return possibleTexts.some((item) => text === item);
      });

      if (element) {
        element.textContent = newValue ?? "-";
        return true;
      }

      return false;
    };

    const fetchDashboard = async (doc) => {
      try {
        const response = await apiFetch("/api/customer/dashboard");

        if (!response.ok) {
          let errorMessage = `Customer Dashboard API failed: ${response.status}`;

          try {
            const errorData = await response.json();

            if (errorData?.detail) {
              errorMessage =
                typeof errorData.detail === "string"
                  ? errorData.detail
                  : JSON.stringify(errorData.detail);
            }
          } catch {
            // Ignore JSON parsing errors
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();

        console.log("Customer Dashboard API:", data);

        const customer = data.customer || {};

        /*
         * Customer name
         */
        replaceText(
          doc,
          [
            "John Doe",
            "John Smith",
            "Customer Name",
            "Acme Manufacturing Corp.",
          ],
          customer.name || "-"
        );

        /*
         * Equipment count
         */
        replaceText(
          doc,
          [
            "12",
            "8",
            "5",
            "Total Equipment",
          ],
          String(data.equipment_count ?? 0)
        );

        /*
         * Service requests
         */
        replaceText(
          doc,
          [
            "3",
            "5",
            "2",
            "Service Requests",
          ],
          String(data.service_requests ?? 0)
        );

        /*
         * Active AMC
         */
        replaceText(
          doc,
          [
            "1",
            "2",
            "Active AMC",
          ],
          String(data.active_amc ?? 0)
        );

        /*
         * Email
         */
        replaceText(
          doc,
          [
            "customer@example.com",
            "john@example.com",
          ],
          customer.email || "-"
        );
      } catch (error) {
        console.error("Customer Dashboard Error:", error);
      }
    };

    const handleLoad = () => {
      setTimeout(() => {
        const doc = iframe.contentDocument;

        if (!doc) return;

        fetchDashboard(doc);
      }, 300);
    };

    iframe.addEventListener("load", handleLoad);

    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Customer Dashboard"
      src="/stitch/customer_dashboard_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}