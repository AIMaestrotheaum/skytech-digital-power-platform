import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

export default function PortalLogin() {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe) return;

    const setupLogin = () => {
      const doc = iframe.contentDocument;

      if (!doc) return;

      const form = doc.querySelector("form");

      const emailInput = doc.querySelector("#username");
      const passwordInput = doc.querySelector("#password");
      const rememberInput = doc.querySelector("#remember-me");

      const tabs = doc.querySelectorAll('[role="tab"]');

      if (!form || !emailInput || !passwordInput) {
        return;
      }

      // Prevent duplicate event listeners
      if (form.dataset.reactConnected === "true") {
        return;
      }

      form.dataset.reactConnected = "true";

      // =====================================================
      // CUSTOMER / ADMIN TABS
      // =====================================================

      let activeRole = "customer";

      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          if (tab.id === "tab-admin") {
            activeRole = "admin";
          } else {
            activeRole = "customer";
          }
        });
      });

      // =====================================================
      // PASSWORD VISIBILITY
      // =====================================================

      const visibilityButton = passwordInput.parentElement?.querySelector(
        'button[type="button"]'
      );

      if (visibilityButton) {
        visibilityButton.addEventListener("click", () => {
          if (passwordInput.type === "password") {
            passwordInput.type = "text";

            const icon = visibilityButton.querySelector(
              ".material-symbols-outlined"
            );

            if (icon) {
              icon.textContent = "visibility";
            }
          } else {
            passwordInput.type = "password";

            const icon = visibilityButton.querySelector(
              ".material-symbols-outlined"
            );

            if (icon) {
              icon.textContent = "visibility_off";
            }
          }
        });
      }

      // =====================================================
      // LOGIN
      // =====================================================

      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberInput?.checked || false;

        if (!email || !password) {
          alert("Please enter your email and password.");
          return;
        }

        const submitButton = form.querySelector(
          'button[type="submit"]'
        );

        if (!submitButton) return;

        const originalButtonHTML = submitButton.innerHTML;

        submitButton.disabled = true;

        submitButton.innerHTML = `
          <span class="material-symbols-outlined text-[20px]">
            progress_activity
          </span>
          Authenticating...
        `;

        try {
          const data = await loginUser(email, password);

          // =================================================
          // STORE AUTH DATA
          // =================================================

          const storage = rememberMe
            ? window.localStorage
            : window.sessionStorage;

          storage.setItem(
            "access_token",
            data.access_token
          );

          storage.setItem(
            "token_type",
            data.token_type
          );

          storage.setItem(
            "role",
            data.role
          );

          storage.setItem(
            "user_id",
            String(data.user_id)
          );

          storage.setItem(
            "name",
            data.name
          );

          // =================================================
          // ROLE CHECK
          // =================================================

          if (data.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/portal/dashboard");
          }

        } catch (error) {
          alert(
            error.message ||
              "Invalid email or password."
          );

          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonHTML;
        }
      });
    };

    iframe.addEventListener("load", setupLogin);

    // In case iframe already loaded
    if (iframe.contentDocument?.readyState === "complete") {
      setupLogin();
    }

    return () => {
      iframe.removeEventListener("load", setupLogin);
    };
  }, [navigate]);

  return (
    <iframe
      ref={iframeRef}
      title="SKYTECH Portal Login"
      src="/stitch/portal_login_skytech_electricals/code.html"
      className="w-full h-screen border-0 block"
    />
  );
}