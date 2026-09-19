import { useEffect, useRef } from "react";

export default function ServiceRequests() {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    let searchInput = null;
    let searchHandler = null;

    let statusSelect = null;
    let statusHandler = null;

    let prioritySelect = null;
    let priorityHandler = null;

    let previousButton = null;
    let nextButton = null;

    let previousHandler = null;
    let nextHandler = null;

    let currentSearch = "";
    let currentStatus = "";
    let currentPriority = "";
    let currentPage = 1;

    const getToken = () =>
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    const renderRequests = (doc, data) => {
      const main =
        doc.querySelector("main") || doc.body;

      const table = main.querySelector("table");

      if (table) {
        const tbody = table.querySelector("tbody");

        if (tbody) {
          tbody.innerHTML = "";

          data.requests.forEach((request) => {
            const row = doc.createElement("tr");

            row.innerHTML = `
              <td>
                <a
                  href="#"
                  class="service-request-detail-link"
                  data-request-id="${request.id}"
                  style="
                    color: #0050cc;
                    font-weight: 600;
                    text-decoration: none;
                    cursor: pointer;
                  "
                >
                  ${request.request_code || "-"}
                </a>
              </td>

              <td>
                ${request.customer_name || "-"}
              </td>

              <td>
                ${request.company || "-"}
              </td>

              <td>
                ${request.issue || "-"}
              </td>

              <td>
                ${request.priority || "-"}
              </td>

              <td>
                ${request.status || "-"}
              </td>

              <td>
                ${request.assigned_to || "-"}
              </td>

              <td>
                ${
                  request.created_at
                    ? new Date(
                        request.created_at
                      ).toLocaleDateString("en-IN")
                    : "-"
                }
              </td>
            `;

            tbody.appendChild(row);

            const requestLink =
              row.querySelector(
                ".service-request-detail-link"
              );

            if (requestLink) {
              requestLink.addEventListener(
                "click",
                (event) => {
                  event.preventDefault();

                  const requestId =
                    requestLink.getAttribute(
                      "data-request-id"
                    );

                  if (requestId) {
                    sessionStorage.setItem(
                      "selected_service_request_id",
                      requestId
                    );

                    console.log(
                      "Selected service request:",
                      requestId
                    );
                  }
                }
              );
            }
          });
        }
      }

      /*
       * Pagination text
       */
      const paginationText = Array.from(
        main.querySelectorAll("*")
      ).find(
        (element) =>
          element.children.length === 0 &&
          /showing.*of/i.test(
            element.textContent.trim()
          )
      );

      if (paginationText) {
        const start =
          data.total === 0
            ? 0
            : (data.page - 1) *
                data.limit +
              1;

        const end =
          (data.page - 1) *
            data.limit +
          data.requests.length;

        paginationText.textContent =
          `Showing ${start}-${end} of ${data.total} requests`;
      }

      /*
       * Previous button
       */
      if (previousButton) {
        previousButton.disabled =
          data.page <= 1;

        previousButton.style.opacity =
          data.page <= 1 ? "0.5" : "1";

        previousButton.style.pointerEvents =
          data.page <= 1
            ? "none"
            : "auto";
      }

      /*
       * Next button
       */
      if (nextButton) {
        nextButton.disabled =
          data.page >= data.total_pages;

        nextButton.style.opacity =
          data.page >= data.total_pages
            ? "0.5"
            : "1";

        nextButton.style.pointerEvents =
          data.page >= data.total_pages
            ? "none"
            : "auto";
      }

      console.log(
        `Service Request Page ${data.page} of ${data.total_pages}`
      );
    };

    const fetchRequests = async (doc) => {
      const token = getToken();

      if (!token) {
        console.error(
          "No access token found."
        );
        return;
      }

      try {
        const url = new URL(
          "http://127.0.0.1:8000/api/admin/service-requests"
        );

        if (currentSearch.trim()) {
          url.searchParams.set(
            "search",
            currentSearch.trim()
          );
        }

        if (currentStatus.trim()) {
          url.searchParams.set(
            "status",
            currentStatus.trim()
          );
        }

        if (currentPriority.trim()) {
          url.searchParams.set(
            "priority",
            currentPriority.trim()
          );
        }

        url.searchParams.set(
          "page",
          currentPage
        );

        url.searchParams.set(
          "limit",
          "10"
        );

        const response = await fetch(
          url.toString(),
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Service Requests API failed: ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          "Service Requests API:",
          data
        );

        renderRequests(
          doc,
          data
        );
      } catch (error) {
        console.error(
          "Service Requests Error:",
          error
        );
      }
    };

    let mainElement = null;

    const findButton = (keywords) => {
      if (!mainElement) return null;

      const buttons = Array.from(
        mainElement.querySelectorAll(
          "button, a, [role='button']"
        )
      );

      return (
        buttons.find((button) => {
          const text =
            button.textContent
              ?.trim()
              .toLowerCase() || "";

          const aria =
            button
              .getAttribute(
                "aria-label"
              )
              ?.toLowerCase() || "";

          const title =
            button
              .getAttribute("title")
              ?.toLowerCase() || "";

          const combined =
            `${text} ${aria} ${title}`;

          return keywords.some(
            (keyword) =>
              combined.includes(keyword)
          );
        }) || null
      );
    };

    const setupPage = () => {
      const doc =
        iframe.contentDocument;

      if (!doc) return;

      mainElement =
        doc.querySelector("main") ||
        doc.body;

      currentPage = 1;

      fetchRequests(doc);

      /*
       * SEARCH
       */
      const inputs = Array.from(
        doc.querySelectorAll("input")
      );

      searchInput =
        inputs.find((input) => {
          const placeholder =
            input
              .getAttribute(
                "placeholder"
              )
              ?.toLowerCase() || "";

          const ariaLabel =
            input
              .getAttribute(
                "aria-label"
              )
              ?.toLowerCase() || "";

          return (
            placeholder.includes(
              "search"
            ) ||
            ariaLabel.includes(
              "search"
            )
          );
        }) || null;

      if (searchInput) {
        console.log(
          "Service request search connected"
        );

        searchHandler = () => {
          currentSearch =
            searchInput.value;

          currentPage = 1;

          fetchRequests(doc);
        };

        searchInput.addEventListener(
          "input",
          searchHandler
        );
      }

      /*
       * SELECT FILTERS
       */
      const selects = Array.from(
        doc.querySelectorAll("select")
      );

      selects.forEach((select) => {
        const text =
          select.parentElement
            ?.textContent
            ?.toLowerCase() || "";

        const ariaLabel =
          select
            .getAttribute(
              "aria-label"
            )
            ?.toLowerCase() || "";

        const name =
          select
            .getAttribute("name")
            ?.toLowerCase() || "";

        const id =
          select
            .getAttribute("id")
            ?.toLowerCase() || "";

        const combined =
          `${text} ${ariaLabel} ${name} ${id}`;

        /*
         * STATUS
         */
        if (
          !statusSelect &&
          combined.includes("status")
        ) {
          statusSelect = select;

          console.log(
            "Service request status filter connected"
          );

          statusHandler = () => {
            currentStatus =
              statusSelect.value;

            currentPage = 1;

            fetchRequests(doc);
          };

          statusSelect.addEventListener(
            "change",
            statusHandler
          );
        }

        /*
         * PRIORITY
         */
        if (
          !prioritySelect &&
          combined.includes("priority")
        ) {
          prioritySelect = select;

          console.log(
            "Service request priority filter connected"
          );

          priorityHandler = () => {
            currentPriority =
              prioritySelect.value;

            currentPage = 1;

            fetchRequests(doc);
          };

          prioritySelect.addEventListener(
            "change",
            priorityHandler
          );
        }
      });

      /*
       * PAGINATION
       */
      previousButton = findButton([
        "previous",
        "prev",
        "chevron_left",
        "arrow_back",
      ]);

      nextButton = findButton([
        "next",
        "chevron_right",
        "arrow_forward",
      ]);

      if (previousButton) {
        previousHandler = (event) => {
          event.preventDefault();

          if (currentPage > 1) {
            currentPage -= 1;

            fetchRequests(doc);
          }
        };

        previousButton.addEventListener(
          "click",
          previousHandler
        );
      }

      if (nextButton) {
        nextHandler = (event) => {
          event.preventDefault();

          currentPage += 1;

          fetchRequests(doc);
        };

        nextButton.addEventListener(
          "click",
          nextHandler
        );
      }

      console.log(
        "Service request pagination connected:",
        {
          previousButton,
          nextButton,
        }
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
        searchInput &&
        searchHandler
      ) {
        searchInput.removeEventListener(
          "input",
          searchHandler
        );
      }

      if (
        statusSelect &&
        statusHandler
      ) {
        statusSelect.removeEventListener(
          "change",
          statusHandler
        );
      }

      if (
        prioritySelect &&
        priorityHandler
      ) {
        prioritySelect.removeEventListener(
          "change",
          priorityHandler
        );
      }

      if (
        previousButton &&
        previousHandler
      ) {
        previousButton.removeEventListener(
          "click",
          previousHandler
        );
      }

      if (
        nextButton &&
        nextHandler
      ) {
        nextButton.removeEventListener(
          "click",
          nextHandler
        );
      }
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Support AMC Requests"
      src="/stitch/support_amc_requests_skytech/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}