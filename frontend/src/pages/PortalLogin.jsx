import { useEffect, useRef } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { loginUser } from "../api/auth";
import { clearAuth } from "../utils/auth";

export default function PortalLogin() {
  const iframeRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const requestedPath =
    location.state?.from || null;

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) {
      return undefined;
    }

    let timeoutId = null;
    let cleanupLogin = null;
    let isMounted = true;

    const setupLogin = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        if (!isMounted) {
          return;
        }

        const doc =
          iframe.contentDocument ||
          iframe.contentWindow?.document;

        if (!doc) {
          return;
        }

        const form = doc.querySelector("form");

        const emailInput =
          doc.querySelector("#username");

        const passwordInput =
          doc.querySelector("#password");

        const rememberInput =
          doc.querySelector("#remember-me");

        const tabs =
          doc.querySelectorAll(
            '[role="tab"]'
          );

        if (
          !form ||
          !emailInput ||
          !passwordInput
        ) {
          console.error(
            "Portal login form elements were not found."
          );

          return;
        }

        if (cleanupLogin) {
          cleanupLogin();
          cleanupLogin = null;
        }

        /*
         * CUSTOMER / ADMIN TABS
         */
        let activeRole = "customer";

        const tabHandlers = [];

        tabs.forEach((tab) => {
          const handler = () => {
            activeRole =
              tab.id === "tab-admin"
                ? "admin"
                : "customer";
          };

          tab.addEventListener(
            "click",
            handler
          );

          tabHandlers.push({
            tab,
            handler,
          });
        });

        /*
         * PASSWORD VISIBILITY
         */
        const visibilityButton =
          passwordInput.parentElement?.querySelector(
            'button[type="button"]'
          );

        let visibilityHandler = null;

        if (visibilityButton) {
          visibilityHandler = () => {
            const isPassword =
              passwordInput.type ===
              "password";

            passwordInput.type = isPassword
              ? "text"
              : "password";

            const icon =
              visibilityButton.querySelector(
                ".material-symbols-outlined"
              );

            if (icon) {
              icon.textContent = isPassword
                ? "visibility"
                : "visibility_off";
            }
          };

          visibilityButton.addEventListener(
            "click",
            visibilityHandler
          );
        }

        /*
         * LOGIN
         */
        const submitHandler = async (
          event
        ) => {
          event.preventDefault();

          const email =
            emailInput.value.trim();

          const password =
            passwordInput.value;

          const rememberMe =
            rememberInput?.checked || false;

          if (!email || !password) {
            alert(
              "Please enter your email and password."
            );

            return;
          }

          const submitButton =
            form.querySelector(
              'button[type="submit"]'
            );

          if (!submitButton) {
            return;
          }

          const originalButtonHTML =
            submitButton.innerHTML;

          submitButton.disabled = true;

          submitButton.innerHTML = `
            <span class="material-symbols-outlined text-[20px]">
              progress_activity
            </span>
            Authenticating...
          `;

          try {
            /*
             * Clear previous authentication.
             */
            clearAuth();

            /*
             * Login API.
             */
            const data =
              await loginUser(
                email,
                password
              );

            if (!isMounted) {
              return;
            }

            /*
             * Validate access token.
             */
            if (!data?.access_token) {
              throw new Error(
                "Login succeeded but no access token was returned."
              );
            }

            /*
             * Validate role.
             */
            if (!data?.role) {
              throw new Error(
                "Login succeeded but no user role was returned."
              );
            }

            /*
             * Validate selected role.
             */
            if (
              activeRole !== data.role
            ) {
              clearAuth();

              throw new Error(
                `You selected ${activeRole}, but this account is registered as ${data.role}.`
              );
            }

            /*
             * Select storage.
             */
            const storage = rememberMe
              ? window.localStorage
              : window.sessionStorage;

            /*
             * Store authentication data.
             */
            storage.setItem(
              "access_token",
              data.access_token
            );

            storage.setItem(
              "token_type",
              data.token_type ||
                "bearer"
            );

            storage.setItem(
              "role",
              data.role
            );

            if (
              data.user_id !== undefined &&
              data.user_id !== null
            ) {
              storage.setItem(
                "user_id",
                String(data.user_id)
              );
            }

            if (data.name) {
              storage.setItem(
                "name",
                data.name
              );
            }

            storage.setItem(
              "user_email",
              email
            );

            /*
             * Determine destination.
             *
             * If ProtectedRoute redirected the user
             * from a protected page, return there
             * when the role is allowed.
             */
            let destination = null;

            if (
              requestedPath &&
              typeof requestedPath === "string" &&
              requestedPath.startsWith("/") &&
              !requestedPath.startsWith("//")
            ) {
              const isAdminPath =
                requestedPath === "/admin" ||
                requestedPath.startsWith(
                  "/admin/"
                );

              const isCustomerPath =
                requestedPath ===
                  "/portal/dashboard" ||
                requestedPath ===
                  "/portal/equipment" ||
                requestedPath.startsWith(
                  "/portal/"
                );

              if (
                data.role === "admin" &&
                isAdminPath
              ) {
                destination =
                  requestedPath;
              }

              if (
                data.role === "customer" &&
                isCustomerPath
              ) {
                destination =
                  requestedPath;
              }
            }

            /*
             * Default role-based destination.
             */
            if (!destination) {
              if (data.role === "admin") {
                destination = "/admin";
              } else if (
                data.role === "customer"
              ) {
                destination =
                  "/portal/dashboard";
              } else {
                clearAuth();

                throw new Error(
                  `Unsupported user role: ${data.role}`
                );
              }
            }

            navigate(destination, {
              replace: true,
              state: {},
            });
          } catch (error) {
            if (!isMounted) {
              return;
            }

            console.error(
              "Portal Login Error:",
              error
            );

            alert(
              error?.message ||
                "Invalid email or password."
            );

            submitButton.disabled =
              false;

            submitButton.innerHTML =
              originalButtonHTML;
          }
        };

        form.addEventListener(
          "submit",
          submitHandler
        );

        /*
         * Cleanup iframe listeners.
         */
        cleanupLogin = () => {
          form.removeEventListener(
            "submit",
            submitHandler
          );

          tabHandlers.forEach(
            ({ tab, handler }) => {
              tab.removeEventListener(
                "click",
                handler
              );
            }
          );

          if (
            visibilityButton &&
            visibilityHandler
          ) {
            visibilityButton.removeEventListener(
              "click",
              visibilityHandler
            );
          }
        };
      }, 300);
    };

    iframe.addEventListener(
      "load",
      setupLogin
    );

    /*
     * Handle already-loaded iframe.
     */
    if (
      iframe.contentDocument?.readyState ===
      "complete"
    ) {
      setupLogin();
    }

    return () => {
      isMounted = false;

      iframe.removeEventListener(
        "load",
        setupLogin
      );

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      if (cleanupLogin) {
        cleanupLogin();
      }
    };
  }, [navigate, requestedPath]);

  return (
    <div className="w-full min-h-[calc(100vh-72px)] overflow-hidden">
      <iframe
        ref={iframeRef}
        title="SKYTECH Portal Login"
        src="/stitch/portal_login_skytech_electricals/code.html"
        className="block w-full min-h-[calc(100vh-72px)] h-[calc(100vh-72px)] border-0"
      />
    </div>
  );
}