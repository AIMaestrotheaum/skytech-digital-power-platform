import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

const ROUTES = {
  Dashboard: "/portal/dashboard",
  Home: "/portal/dashboard",

  Equipment: "/portal/equipment",
  "My Equipment": "/portal/equipment",

  "Service History": "/portal/service-history",

  "Request Service": "/support/amc-request",
  "Service Request": "/support/amc-request",
  "AMC Request": "/support/amc-request",
  "Request Support": "/support/amc-request",
  Support: "/support/amc-request",

  Logout: "/portal/login",
};

function normalizeText(value) {
  return (
    value
      ?.replace(/\s+/g, " ")
      .trim()
      .toLowerCase() || ""
  );
}

function getRouteFromText(text) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return null;
  }

  const matchedLabel = Object.keys(ROUTES).find(
    (label) =>
      normalizeText(label) === normalized
  );

  return matchedLabel
    ? ROUTES[matchedLabel]
    : null;
}

function clearAuthStorage() {
  const localKeys = [
    "access_token",
    "token_type",
    "role",
    "user_email",
    "user_id",
    "name",
  ];

  const sessionKeys = [
    ...localKeys,
    "selected_lead_id",
    "selected_quote_id",
    "selected_amc_id",
    "selected_amc_detail",
    "selected_service_request_id",
    "selected_service_request_detail",
  ];

  localKeys.forEach((key) => {
    localStorage.removeItem(key);
  });

  sessionKeys.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

export default function ServiceHistory() {
  const iframeRef = useRef(null);

  const navigate = useNavigate();

  const [showRequestModal, setShowRequestModal] =
    useState(false);

  const [equipment, setEquipment] =
    useState([]);

  const [selectedEquipment, setSelectedEquipment] =
    useState("");

  const [issue, setIssue] =
    useState("");

  const [priority, setPriority] =
    useState("normal");

  const [submitting, setSubmitting] =
    useState(false);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [error, setError] =
    useState("");

  const [serviceHistory, setServiceHistory] =
    useState([]);

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const getErrorMessage = async (
    response,
    fallback
  ) => {
    let message =
      fallback ||
      `Request failed: ${response.status}`;

    try {
      const data = await response.json();

      if (data?.detail) {
        message =
          typeof data.detail === "string"
            ? data.detail
            : JSON.stringify(data.detail);
      } else if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep fallback.
    }

    return message;
  };

  const loadEquipment = async () => {
    try {
      const response = await apiFetch(
        "/api/customer/equipment"
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            `Equipment API failed: ${response.status}`
          )
        );
      }

      const data = await response.json();

      const records = Array.isArray(data)
        ? data
        : Array.isArray(data?.equipment)
        ? data.equipment
        : [];

      setEquipment(records);

      /*
       * Automatically select the first
       * equipment record if available.
       */
      if (records.length > 0) {
        const first = records[0];

        const firstId =
          first?.id ??
          first?.equipment_id ??
          first?.equipment_code ??
          "";

        if (firstId !== "") {
          setSelectedEquipment(
            String(firstId)
          );
        }
      }
    } catch (err) {
      console.error(
        "Customer Equipment Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load equipment."
      );
    }
  };

  const loadServiceHistory = async () => {
    setLoadingHistory(true);
    setError("");

    try {
      const response = await apiFetch(
        "/api/customer/service-history"
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            `Service History API failed: ${response.status}`
          )
        );
      }

      const data = await response.json();

      const records = Array.isArray(data)
        ? data
        : Array.isArray(
            data?.service_history
          )
        ? data.service_history
        : Array.isArray(data?.requests)
        ? data.requests
        : Array.isArray(
            data?.service_requests
          )
        ? data.service_requests
        : [];

      setServiceHistory(records);
    } catch (err) {
      console.error(
        "Customer Service History Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load service history."
      );

      setServiceHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadEquipment();
    loadServiceHistory();
  }, []);

  const getEquipmentId = (item) => {
    return (
      item?.id ??
      item?.equipment_id ??
      item?.equipment_code ??
      ""
    );
  };

  const getEquipmentLabel = (
    equipmentId
  ) => {
    if (
      equipmentId === null ||
      equipmentId === undefined ||
      equipmentId === ""
    ) {
      return "-";
    }

    const item = equipment.find(
      (equipmentItem) =>
        String(
          getEquipmentId(equipmentItem)
        ) === String(equipmentId)
    );

    if (!item) {
      return String(equipmentId);
    }

    return (
      item.equipment_name ||
      item.equipment_code ||
      item.model ||
      String(equipmentId)
    );
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

  const handleCreateRequest = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    if (!issue.trim()) {
      setError(
        "Please describe the issue or service requirement."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        issue: issue.trim(),
        priority:
          priority.toLowerCase(),
      };

      if (selectedEquipment) {
        payload.equipment_id =
          selectedEquipment;
      }

      const response = await apiFetch(
        "/api/customer/service-requests",
        {
          method: "POST",
          body: payload,
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Unable to create service request."
        );
      }

      const requestId =
        data?.id ??
        data?.request_id ??
        data?.service_request_id;

      if (requestId) {
        sessionStorage.setItem(
          "selected_service_request_id",
          String(requestId)
        );
      }

      setShowRequestModal(false);
      setIssue("");
      setPriority("normal");
      setError("");

      await loadServiceHistory();
    } catch (err) {
      console.error(
        "Create Service Request Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to submit service request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openRequestDetails = async (
    request
  ) => {
    const requestId =
      request?.id ??
      request?.request_id ??
      request?.service_request_id;

    if (!requestId) {
      setSelectedRequest(request);
      setShowDetails(true);
      return;
    }

    sessionStorage.setItem(
      "selected_service_request_id",
      String(requestId)
    );

    try {
      const response = await apiFetch(
        `/api/customer/service-history/${requestId}`
      );

      if (!response.ok) {
        throw new Error(
          await getErrorMessage(
            response,
            `Unable to load request details: ${response.status}`
          )
        );
      }

      const data = await response.json();

      setSelectedRequest(data);

      sessionStorage.setItem(
        "selected_service_request_detail",
        JSON.stringify(data)
      );
    } catch (err) {
      console.error(
        "Service Request Detail Error:",
        err
      );

      /*
       * If detail loading fails, still show
       * the record already present in the list.
       */
      setSelectedRequest(request);
    }

    setShowDetails(true);
  };

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let iframeDocument = null;
    let isMounted = true;

    const openRequestModal = (event) => {
      const target = event.target;

      if (
        !target ||
        !(target instanceof Element)
      ) {
        return;
      }

      const element =
        target.closest("a, button");

      if (!element) {
        return;
      }

      if (
        element.hasAttribute("disabled") ||
        element.getAttribute(
          "aria-disabled"
        ) === "true"
      ) {
        return;
      }

      const text = normalizeText(
        element.textContent
      );

      const aria = normalizeText(
        element.getAttribute("aria-label")
      );

      const title = normalizeText(
        element.getAttribute("title")
      );

      const combined =
        `${text} ${aria} ${title}`.trim();

      const href =
        element.getAttribute("href") || "";

      /*
       * Service-request actions must open
       * the React modal rather than navigate
       * to a dead Stitch page.
       */
      if (
        combined.includes(
          "request service"
        ) ||
        combined.includes(
          "raise request"
        ) ||
        combined.includes(
          "new request"
        ) ||
        combined.includes(
          "service request"
        ) ||
        combined.includes(
          "request support"
        ) ||
        combined.includes(
          "raise service"
        )
      ) {
        event.preventDefault();
        event.stopPropagation();

        setError("");
        setShowRequestModal(true);
        return;
      }

      /*
       * Handle normal internal React routes.
       */
      if (
        href.startsWith("/") &&
        !href.startsWith("//")
      ) {
        event.preventDefault();
        event.stopPropagation();

        navigate(href);
        return;
      }

      /*
       * Handle known portal navigation
       * based on button/link text.
       */
      const route =
        getRouteFromText(
          text
        ) ||
        getRouteFromText(
          aria
        ) ||
        getRouteFromText(
          title
        );

      if (route) {
        event.preventDefault();
        event.stopPropagation();

        if (
          route === "/portal/login"
        ) {
          clearAuthStorage();
        }

        navigate(route);
        return;
      }

      /*
       * Leave external links untouched.
       */
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      /*
       * Prevent Stitch placeholder links
       * from navigating inside the iframe.
       */
      if (
        href === "#" ||
        href === "" ||
        href.endsWith(".html") ||
        href.startsWith("./") ||
        href.startsWith("../")
      ) {
        event.preventDefault();
      }
    };

    const setupIframe = () => {
      if (!isMounted) {
        return;
      }

      const doc =
        iframe.contentDocument ||
        iframe.contentWindow?.document;

      if (!doc) {
        return;
      }

      iframeDocument = doc;

      doc.addEventListener(
        "click",
        openRequestModal
      );
    };

    const handleLoad = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(
        setupIframe,
        300
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
      isMounted = false;

      iframe.removeEventListener(
        "load",
        handleLoad
      );

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      if (iframeDocument) {
        iframeDocument.removeEventListener(
          "click",
          openRequestModal
        );
      }

      iframeDocument = null;
    };
  }, [navigate]);

  return (
    <div className="relative w-full min-h-[calc(100vh-72px)] overflow-x-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Customer Service History"
        src="/stitch/service_history_schedule_skytech_portal/code.html"
        className="block w-full border-0"
        style={{
          height:
            "max(720px, calc(100vh - 72px))",
        }}
      />

      {showRequestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Raise Service Request
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Submit your equipment service requirement.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRequestModal(
                    false
                  );
                  setError("");
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            <form
              onSubmit={
                handleCreateRequest
              }
              className="space-y-5 p-6"
            >
              <div>
                <label
                  htmlFor="equipment"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Equipment
                </label>

                <select
                  id="equipment"
                  value={
                    selectedEquipment
                  }
                  onChange={(event) =>
                    setSelectedEquipment(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">
                    Select equipment
                  </option>

                  {equipment.map(
                    (
                      item,
                      index
                    ) => {
                      const value =
                        getEquipmentId(
                          item
                        ) ||
                        index;

                      return (
                        <option
                          key={value}
                          value={value}
                        >
                          {item.equipment_name ||
                            item.equipment_code ||
                            item.model ||
                            `Equipment ${
                              index + 1
                            }`}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="normal">
                    Normal
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="critical">
                    Critical
                  </option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="issue"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Issue / Service Requirement
                </label>

                <textarea
                  id="issue"
                  value={issue}
                  onChange={(event) =>
                    setIssue(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Describe the issue or service requirement..."
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(
                      false
                    );
                    setError("");
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails &&
        selectedRequest && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Service Request Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedRequest.request_code ||
                      selectedRequest.id ||
                      "-"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetails(
                      false
                    )
                  }
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined">
                    close
                  </span>
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Issue
                  </p>

                  <p className="mt-1 text-sm text-slate-900">
                    {selectedRequest.issue ||
                      selectedRequest.description ||
                      "-"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Status
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {selectedRequest.status ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Priority
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {selectedRequest.priority ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Equipment
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {getEquipmentLabel(
                        selectedRequest.equipment_id
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Created
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {formatDate(
                        selectedRequest.created_at
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {loadingHistory && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-[90] rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
          Updating service history...
        </div>
      )}
    </div>
  );
}