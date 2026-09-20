import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

const STATUS_OPTIONS = [
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

const PRIORITY_OPTIONS = [
  "low",
  "normal",
  "high",
  "critical",
];

export default function ServiceRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRequest, setSelectedRequest] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [editStatus, setEditStatus] =
    useState("");

  const [editPriority, setEditPriority] =
    useState("");

  const [editAssignedTo, setEditAssignedTo] =
    useState("");

  const loadRequests = async (
    requestedPage = page
  ) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (statusFilter) {
        params.set(
          "status",
          statusFilter
        );
      }

      if (priorityFilter) {
        params.set(
          "priority",
          priorityFilter
        );
      }

      params.set(
        "page",
        String(requestedPage)
      );

      params.set(
        "limit",
        String(limit)
      );

      const response = await apiFetch(
        `/api/admin/service-requests?${params.toString()}`
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
            `Unable to load service requests (${response.status}).`
        );
      }

      const records = Array.isArray(data)
        ? data
        : data?.requests || [];

      setRequests(records);

      setTotal(
        Number(data?.total || records.length)
      );

      setTotalPages(
        Math.max(
          1,
          Number(data?.total_pages || 1)
        )
      );

      setPage(
        Number(data?.page || requestedPage)
      );
    } catch (err) {
      console.error(
        "Admin Service Requests Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load service requests."
      );

      setRequests([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(1);
  }, [statusFilter, priorityFilter]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadRequests(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setPage(1);
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

  const formatStatus = (value) => {
    if (!value) {
      return "-";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatPriority = (value) => {
    if (!value) {
      return "-";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusClass = (value) => {
    switch (
      String(value || "").toLowerCase()
    ) {
      case "open":
        return "bg-blue-50 text-blue-700";

      case "assigned":
        return "bg-purple-50 text-purple-700";

      case "in_progress":
        return "bg-amber-50 text-amber-700";

      case "resolved":
        return "bg-emerald-50 text-emerald-700";

      case "closed":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPriorityClass = (value) => {
    switch (
      String(value || "").toLowerCase()
    ) {
      case "critical":
        return "bg-red-50 text-red-700";

      case "high":
        return "bg-orange-50 text-orange-700";

      case "normal":
        return "bg-blue-50 text-blue-700";

      case "low":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const openDetails = async (request) => {
    const requestId =
      request?.id ??
      request?.request_id ??
      request?.service_request_id;

    if (!requestId) {
      setSelectedRequest(request);

      setEditStatus(
        request?.status || ""
      );

      setEditPriority(
        request?.priority || ""
      );

      setEditAssignedTo(
        request?.assigned_to || ""
      );

      setShowDetails(true);
      return;
    }

    setDetailsLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `/api/admin/service-requests/${requestId}`
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
            `Unable to load request details (${response.status}).`
        );
      }

      setSelectedRequest(data);

      setEditStatus(
        data?.status || ""
      );

      setEditPriority(
        data?.priority || ""
      );

      setEditAssignedTo(
        data?.assigned_to || ""
      );

      sessionStorage.setItem(
        "selected_service_request_id",
        String(requestId)
      );

      sessionStorage.setItem(
        "selected_service_request_detail",
        JSON.stringify(data)
      );

      setShowDetails(true);
    } catch (err) {
      console.error(
        "Service Request Detail Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load request details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateRequest = async () => {
    if (!selectedRequest) {
      return;
    }

    const requestId =
      selectedRequest?.id ??
      selectedRequest?.request_id ??
      selectedRequest?.service_request_id;

    if (!requestId) {
      setError(
        "Service request ID is missing."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(
        `/api/admin/service-requests/${requestId}`,
        {
          method: "PUT",
          body: {
            status:
              editStatus || null,
            priority:
              editPriority || null,
            assigned_to:
              editAssignedTo.trim() || null,
          },
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
            "Unable to update service request."
        );
      }

      const updatedRequest = {
        ...selectedRequest,
        ...(data || {}),
        status: editStatus,
        priority: editPriority,
        assigned_to:
          editAssignedTo.trim() || null,
      };

      setSelectedRequest(
        updatedRequest
      );

      sessionStorage.setItem(
        "selected_service_request_detail",
        JSON.stringify(
          updatedRequest
        )
      );

      await loadRequests(page);

      window.alert(
        data?.message ||
          "Service request updated successfully."
      );
    } catch (err) {
      console.error(
        "Update Service Request Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to update service request."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Service Requests
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage customer service requests,
              priorities, assignments and status.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadRequests(page)
            }
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">
              refresh
            </span>

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {/* FILTERS */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5"
          >
            <div className="lg:col-span-2">
              <label
                htmlFor="service-search"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Search
              </label>

              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-slate-400">
                  search
                </span>

                <input
                  id="service-search"
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Customer, company, issue or request code..."
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status-filter"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Status
              </label>

              <select
                id="status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  All Statuses
                </option>

                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {formatStatus(option)}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="priority-filter"
                className="mb-1.5 block text-xs font-medium text-slate-600"
              >
                Priority
              </label>

              <select
                id="priority-filter"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">
                  All Priorities
                </option>

                {PRIORITY_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {formatPriority(option)}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Search
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span className="material-symbols-outlined text-[20px]">
              error
            </span>

            <span>{error}</span>
          </div>
        )}

        {/* SUMMARY */}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {requests.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {total}
            </span>{" "}
            service requests
          </p>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Request
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Company
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Issue
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assigned To
                  </th>

                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-12 text-center"
                    >
                      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <span className="material-symbols-outlined animate-spin text-[20px]">
                          progress_activity
                        </span>

                        Loading service requests...
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-12 text-center"
                    >
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300">
                          support_agent
                        </span>

                        <p className="mt-3 text-sm font-medium text-slate-700">
                          No service requests found
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Try changing your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map(
                    (request) => {
                      const requestId =
                        request.id ??
                        request.request_id ??
                        request.service_request_id;

                      return (
                        <tr
                          key={requestId}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">
                            <p className="font-semibold text-slate-900">
                              {request.request_code ||
                                `#${requestId}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              ID:{" "}
                              {requestId ||
                                "-"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {request.customer_name ||
                              "-"}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {request.company ||
                              "-"}
                          </td>

                          <td className="max-w-[240px] px-4 py-4">
                            <p
                              className="truncate text-sm text-slate-700"
                              title={
                                request.issue ||
                                ""
                              }
                            >
                              {request.issue ||
                                "-"}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClass(
                                request.priority
                              )}`}
                            >
                              {formatPriority(
                                request.priority
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                request.status
                              )}`}
                            >
                              {formatStatus(
                                request.status
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700">
                            {request.assigned_to ||
                              "Unassigned"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                            {formatDate(
                              request.created_at
                            )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(
                                  request
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                visibility
                              </span>

                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-900">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {totalPages}
              </span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={
                  page <= 1 ||
                  loading
                }
                onClick={() =>
                  loadRequests(
                    page - 1
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  loading
                }
                onClick={() =>
                  loadRequests(
                    page + 1
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Service Request Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedRequest?.request_code ||
                    selectedRequest?.id ||
                    "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDetails(false)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close"
              >
                <span className="material-symbols-outlined">
                  close
                </span>
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-slate-500">
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>

                Loading request details...
              </div>
            ) : (
              <div className="space-y-5 p-6">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {selectedRequest?.customer_name ||
                        "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Company
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {selectedRequest?.company ||
                        "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Issue
                  </p>

                  <div className="mt-2 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {selectedRequest?.issue ||
                      selectedRequest?.description ||
                      "-"}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="edit-status"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Status
                    </label>

                    <select
                      id="edit-status"
                      value={editStatus}
                      onChange={(event) =>
                        setEditStatus(
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">
                        Select status
                      </option>

                      {STATUS_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {formatStatus(
                              option
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="edit-priority"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Priority
                    </label>

                    <select
                      id="edit-priority"
                      value={editPriority}
                      onChange={(event) =>
                        setEditPriority(
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">
                        Select priority
                      </option>

                      {PRIORITY_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {formatPriority(
                              option
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-assigned-to"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Assigned To
                  </label>

                  <input
                    id="edit-assigned-to"
                    type="text"
                    value={editAssignedTo}
                    onChange={(event) =>
                      setEditAssignedTo(
                        event.target.value
                      )
                    }
                    placeholder="Enter technician or staff name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {formatDate(
                        selectedRequest?.created_at
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Request ID
                    </p>

                    <p className="mt-1 text-sm text-slate-900">
                      {selectedRequest?.id ||
                        "-"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setShowDetails(false)
                    }
                    className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={updateRequest}
                    disabled={saving}
                    className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}