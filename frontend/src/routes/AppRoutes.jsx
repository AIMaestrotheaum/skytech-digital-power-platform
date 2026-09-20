import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "./ProtectedRoute";

// ============================================================
// PUBLIC PAGES
// ============================================================

import Home from "../pages/Home";
import AboutUs from "../pages/AboutUs";
import Products from "../pages/Products";
import Services from "../pages/Services";
import Industries from "../pages/Industries";
import Projects from "../pages/Projects";
import ProjectGallery from "../pages/ProjectGallery";
import KnowledgeCenter from "../pages/KnowledgeCenter";
import ContactUs from "../pages/ContactUs";
import GetAQuote from "../pages/GetAQuote";

import UpsCalculator from "../pages/UpsCalculator";
import BatteryCalculator from "../pages/BatteryCalculator";
import ThreePhaseUps from "../pages/ThreePhaseUps";
import AiPowerAssistant from "../pages/AiPowerAssistant";

import PublicAmcRequest from "../pages/PublicAmcRequest";

// ============================================================
// AUTHENTICATION
// ============================================================

import PortalLogin from "../pages/PortalLogin";
import Register from "../pages/Register";

// ============================================================
// CUSTOMER PORTAL
// ============================================================

import CustomerDashboard from "../pages/CustomerDashboard";
import Equipment from "../pages/customer/EquipmentDetails";
import ServiceHistory from "../pages/customer/ServiceHistory";

// ============================================================
// ADMIN PORTAL
// ============================================================

import AdminDashboard from "../pages/admin/Dashboard";
import LeadManagement from "../pages/admin/LeadManagement";
import LeadDetail from "../pages/admin/LeadDetail";
import QuoteManagement from "../pages/admin/QuoteManagement";
import EditQuotation from "../pages/admin/EditQuotation";
import ServiceAMCManagement from "../pages/admin/ServiceAMCManagement";
import ServiceRequestManagement from "../pages/admin/ServiceRequestManagement";

export default function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC WEBSITE
      ===================================================== */}

      <Route element={<PublicLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/about"
          element={<AboutUs />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
          path="/services"
          element={<Services />}
        />

        <Route
          path="/industries"
          element={<Industries />}
        />

        <Route
          path="/projects"
          element={<Projects />}
        />

        <Route
          path="/project-gallery"
          element={<ProjectGallery />}
        />

        <Route
          path="/knowledge"
          element={<KnowledgeCenter />}
        />

        <Route
          path="/contact"
          element={<ContactUs />}
        />

        <Route
          path="/quote"
          element={<GetAQuote />}
        />

        {/* =================================================
            PUBLIC CALCULATORS / TOOLS
        ================================================= */}

        <Route
          path="/ups-calculator"
          element={<UpsCalculator />}
        />

        <Route
          path="/battery-calculator"
          element={<BatteryCalculator />}
        />

        <Route
          path="/three-phase-ups"
          element={<ThreePhaseUps />}
        />

        <Route
          path="/ai-power-assistant"
          element={<AiPowerAssistant />}
        />

        {/* =================================================
            PUBLIC AMC REQUEST
        ================================================= */}

        <Route
          path="/support/amc-request"
          element={<PublicAmcRequest />}
        />

      </Route>

      {/* =====================================================
          AUTHENTICATION
      ===================================================== */}

      <Route
        path="/portal/login"
        element={<PortalLogin />}
      />

      <Route
        path="/portal/register"
        element={<Register />}
      />

      {/* =====================================================
          CUSTOMER PORTAL
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["customer"]}
          />
        }
      >

        <Route element={<CustomerLayout />}>

          <Route
            path="/portal/dashboard"
            element={<CustomerDashboard />}
          />

          <Route
            path="/portal/equipment"
            element={<Equipment />}
          />

          <Route
            path="/portal/service-history"
            element={<ServiceHistory />}
          />

        </Route>

      </Route>

      {/* =====================================================
          ADMIN PORTAL
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          />
        }
      >

        <Route element={<AdminLayout />}>

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/leads"
            element={<LeadManagement />}
          />

          <Route
            path="/admin/leads/:id"
            element={<LeadDetail />}
          />

          <Route
            path="/admin/quotes"
            element={<QuoteManagement />}
          />

          <Route
            path="/admin/quotes/:id/edit"
            element={<EditQuotation />}
          />

          <Route
            path="/admin/service-amc"
            element={<ServiceAMCManagement />}
          />

          <Route
            path="/admin/service-requests"
            element={<ServiceRequestManagement />}
          />

        </Route>

      </Route>

      {/* =====================================================
          REDIRECTS
      ===================================================== */}

      <Route
        path="/portal"
        element={
          <Navigate
            to="/portal/login"
            replace
          />
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <Navigate
            to="/admin"
            replace
          />
        }
      />

      {/* =====================================================
          404 FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}