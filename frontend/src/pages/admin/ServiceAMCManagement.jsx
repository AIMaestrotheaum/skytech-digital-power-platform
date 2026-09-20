import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function ServiceAMCManagement() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let isMounted = true;
    let iframeDocument = null;

    const getErrorMessage = async (response) => {
      let message =
        `AMC API failed: ${response.status}`;

      try {
        const errorData =
          await response.json();

        if (errorData?.detail) {
          message =
            typeof errorData.detail === "string"
              ? errorData.detail
              : JSON.stringify(
                  errorData.detail
                );
        }
      } catch {
        // Ignore JSON parsing errors.
      }

      return message;
    };

    const formatDate = (value) => {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    };

    const formatCurrency = (value) => {
      const amount = Number(value);

      if (Number.isNaN(amount)) {
        return "-";
      }

      return `₹${amount.toLocaleString(
        "en-IN"
      )}`;
    };

    const createCell = (
      doc,
      row,
      value
    ) => {
      const cell =
        doc.createElement("td");

      cell.textContent =
        value === null ||
        value === undefined ||
        value === ""
          ? "-"
          : String(value);

      cell.style.padding =
        "12px 16px";

      cell.style.borderBottom =
        "1px solid #e5e7eb";

      row.appendChild(cell);

      return cell;
    };

    const findTable = (doc) => {
      return (
        doc.querySelector("table") ||
        null
      );
    };

    const renderContracts = (
      doc,
      contracts
    ) => {
      const table =
        findTable(doc);

      if (!table) {
        console.warn(
          "AMC table not found in Stitch page."
        );
        return;
      }

      let tbody =
        table.querySelector("tbody");

      if (!tbody) {
        tbody =
          doc.createElement("tbody");

        table.appendChild(tbody);
      }

      tbody.innerHTML = "";

      if (contracts.length === 0) {
        const row =
          doc.createElement("tr");

        const cell =
          doc.createElement("td");

        cell.colSpan = 8;
        cell.textContent =
          "No AMC contracts found.";

        cell.style.padding =
          "24px";

        cell.style.textAlign =
          "center";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
      }

      contracts.forEach(
        (contract) => {
          const row =
            doc.createElement("tr");

          row.style.cursor =
            "pointer";

          createCell(
            doc,
            row,
            contract.contract_code ||
              contract.id
          );

          createCell(
            doc,
            row,
            contract.customer_name
          );

          createCell(
            doc,
            row,
            contract.company
          );

          createCell(
            doc,
            row,
            contract.amount !==
              undefined
              ? formatCurrency(
                  contract.amount
                )
              : "-"
          );

          createCell(
            doc,
            row,
            contract.status
          );

          createCell(
            doc,
            row,
            formatDate(
              contract.start_date
            )
          );

          createCell(
            doc,
            row,
            formatDate(
              contract.end_date
            )
          );

          const actionCell =
            doc.createElement("td");

          actionCell.style.padding =
            "12px 16px";

          actionCell.style.borderBottom =
            "1px solid #e5e7eb";

          const viewButton =
            doc.createElement(
              "button"
            );

          viewButton.type =
            "button";

          viewButton.textContent =
            "View";

          viewButton.style.cursor =
            "pointer";

          actionCell.appendChild(
            viewButton
          );

          row.appendChild(
            actionCell
          );

          const openContract = (
            event
          ) => {
            event.preventDefault();
            event.stopPropagation();

            if (!contract.id) {
              console.warn(
                "AMC contract does not contain an ID:",
                contract
              );
              return;
            }

            sessionStorage.setItem(
              "selected_amc_id",
              String(contract.id)
            );

            sessionStorage.setItem(
              "selected_amc_detail",
              JSON.stringify(
                contract
              )
            );

            /*
             * Keep the existing AMC page route.
             * The current architecture uses the
             * same management screen for detail/update.
             */
            navigate(
              "/admin/service-amc"
            );
          };

          viewButton.addEventListener(
            "click",
            openContract
          );

          row.addEventListener(
            "click",
            openContract
          );

          tbody.appendChild(row);
        }
      );
    };

    const loadContracts = async () => {
      try {
        const response =
          await apiFetch(
            "/api/admin/service-amc"
          );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(
              response
            )
          );
        }

        const data =
          await response.json();

        if (!isMounted) {
          return;
        }

        const contracts =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.contracts
              )
            ? data.contracts
            : Array.isArray(
                data?.items
              )
            ? data.items
            : [];

        const doc =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!doc) {
          return;
        }

        iframeDocument = doc;

        renderContracts(
          doc,
          contracts
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Service AMC Management Error:",
          error
        );
      }
    };

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(
          timeoutId
        );
      }

      timeoutId =
        window.setTimeout(() => {
          if (isMounted) {
            loadContracts();
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
        window.clearTimeout(
          timeoutId
        );
      }

      iframeDocument = null;
    };
  }, [navigate]);

  return (
    <div className="w-full min-h-[calc(100vh-72px)] overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Service and AMC Management"
        src="/stitch/service_amc_management_skytech_admin/code.html"
        className="block w-full min-h-[calc(100vh-72px)] h-[calc(100vh-72px)] border-0"
      />
    </div>
  );
}