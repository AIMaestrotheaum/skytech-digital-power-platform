import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function QuoteManagement() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let isMounted = true;

    const formatDate = (value) => {
      if (!value) {
        return "-";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const formatCurrency = (value) => {
      const amount = Number(value);

      if (Number.isNaN(amount)) {
        return "-";
      }

      return `₹${amount.toLocaleString("en-IN")}`;
    };

    const getErrorMessage = async (response) => {
      let message =
        `Quote API failed: ${response.status}`;

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

    const createCell = (
      doc,
      row,
      value
    ) => {
      const cell = doc.createElement("td");

      cell.textContent =
        value === null ||
        value === undefined ||
        value === ""
          ? "-"
          : String(value);

      cell.style.padding = "12px 16px";
      cell.style.borderBottom =
        "1px solid #e5e7eb";

      row.appendChild(cell);

      return cell;
    };

    const findQuoteTable = (doc) => {
      const tables =
        Array.from(
          doc.querySelectorAll("table")
        );

      if (tables.length === 0) {
        return null;
      }

      return tables[0];
    };

    const renderQuotes = (
      doc,
      quotes
    ) => {
      const table =
        findQuoteTable(doc);

      if (!table) {
        console.warn(
          "Quote table not found in Stitch page."
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

      if (quotes.length === 0) {
        const row =
          doc.createElement("tr");

        const cell =
          doc.createElement("td");

        cell.colSpan = 8;
        cell.textContent =
          "No quotations found.";
        cell.style.padding = "24px";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        tbody.appendChild(row);

        return;
      }

      quotes.forEach((quote) => {
        const row =
          doc.createElement("tr");

        row.style.cursor = "pointer";

        createCell(
          doc,
          row,
          quote.quote_code ||
            quote.quote_number ||
            quote.id
        );

        createCell(
          doc,
          row,
          quote.customer_name ||
            quote.customer ||
            "-"
        );

        createCell(
          doc,
          row,
          quote.company || "-"
        );

        createCell(
          doc,
          row,
          quote.requirement || "-"
        );

        createCell(
          doc,
          row,
          quote.total_amount !==
            undefined
            ? formatCurrency(
                quote.total_amount
              )
            : quote.amount !==
              undefined
            ? formatCurrency(
                quote.amount
              )
            : "-"
        );

        createCell(
          doc,
          row,
          quote.status || "-"
        );

        createCell(
          doc,
          row,
          formatDate(
            quote.created_at ||
              quote.createdAt
          )
        );

        const actionCell =
          doc.createElement("td");

        actionCell.style.padding =
          "12px 16px";
        actionCell.style.borderBottom =
          "1px solid #e5e7eb";

        const viewButton =
          doc.createElement("button");

        viewButton.type = "button";
        viewButton.textContent =
          "View";

        viewButton.style.cursor =
          "pointer";

        actionCell.appendChild(
          viewButton
        );
        row.appendChild(actionCell);

        const openQuote = (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (!quote.id) {
            console.warn(
              "Quote does not contain an ID:",
              quote
            );
            return;
          }

          sessionStorage.setItem(
            "selected_quote_id",
            String(quote.id)
          );

          navigate(
            `/admin/quotes/${quote.id}/edit`
          );
        };

        viewButton.addEventListener(
          "click",
          openQuote
        );

        row.addEventListener(
          "click",
          openQuote
        );

        tbody.appendChild(row);
      });
    };

    const loadQuotes = async () => {
      try {
        const response = await apiFetch(
          "/api/admin/quotes"
        );

        if (!response.ok) {
          throw new Error(
            await getErrorMessage(response)
          );
        }

        const data =
          await response.json();

        if (!isMounted) {
          return;
        }

        const quotes =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.quotes
              )
            ? data.quotes
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

        renderQuotes(
          doc,
          quotes
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Quote Management Error:",
          error
        );
      }
    };

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId =
        window.setTimeout(() => {
          if (isMounted) {
            loadQuotes();
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
    };
  }, [navigate]);

  return (
    <div className="w-full min-h-screen overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Quote Management"
        src="/stitch/quote_management_skytech_admin/code.html"
        className="block w-full min-h-screen h-screen border-0"
      />
    </div>
  );
}