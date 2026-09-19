import { useEffect, useRef } from "react";
import { apiFetch } from "../utils/api";

export default function EquipmentDetails() {
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

    const fetchEquipment = async (doc) => {
      try {
        const response = await apiFetch("/api/customer/equipment");

        if (!response.ok) {
          let errorMessage = `Equipment API failed: ${response.status}`;

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

        console.log("Customer Equipment API:", data);

        /*
         * API may return either:
         * { equipment: [...] }
         * or directly [...]
         */
        const equipment = Array.isArray(data)
          ? data
          : data.equipment || [];

        if (equipment.length === 0) {
          console.log("No equipment found for customer.");
          return;
        }

        /*
         * Use the first equipment record for the
         * Stitch equipment details screen.
         */
        const item = equipment[0];

        /*
         * Equipment code
         */
        replaceText(
          doc,
          [
            "EQ-001",
            "EQ-1001",
            "Equipment ID",
            "Equipment Code",
          ],
          item.equipment_code || "-"
        );

        /*
         * Equipment name
         */
        replaceText(
          doc,
          [
            "Online UPS",
            "UPS System",
            "Equipment Name",
          ],
          item.equipment_name || "-"
        );

        /*
         * Equipment type
         */
        replaceText(
          doc,
          [
            "UPS",
            "Equipment Type",
          ],
          item.equipment_type || "-"
        );

        /*
         * Model
         */
        replaceText(
          doc,
          [
            "SKY-UPS-100KVA",
            "Model",
            "Model Number",
          ],
          item.model || "-"
        );

        /*
         * Serial number
         */
        replaceText(
          doc,
          [
            "SN-001",
            "SN-12345",
            "Serial Number",
          ],
          item.serial_number || "-"
        );

        /*
         * Capacity
         */
        replaceText(
          doc,
          [
            "100 kVA",
            "50 kVA",
            "Capacity",
          ],
          item.capacity || "-"
        );

        /*
         * Installation date
         */
        replaceText(
          doc,
          [
            "Installation Date",
            "01/01/2025",
          ],
          item.installation_date || "-"
        );

        /*
         * Warranty end date
         */
        replaceText(
          doc,
          [
            "Warranty End Date",
            "31/12/2026",
          ],
          item.warranty_end_date || "-"
        );

        /*
         * Location
         */
        replaceText(
          doc,
          [
            "Pune",
            "Mumbai",
            "Location",
          ],
          item.location || "-"
        );

        /*
         * Status
         */
        replaceText(
          doc,
          [
            "Active",
            "Operational",
            "Status",
          ],
          item.status || "-"
        );
      } catch (error) {
        console.error("Customer Equipment Error:", error);
      }
    };

    const handleLoad = () => {
      setTimeout(() => {
        const doc = iframe.contentDocument;

        if (!doc) return;

        fetchEquipment(doc);
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
      title="SKYTECH Equipment Details"
      src="/stitch/equipment_details_skytech_portal/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}