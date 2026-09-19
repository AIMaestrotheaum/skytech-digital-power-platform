import { Routes, Route, Navigate } from "react-router-dom";

// Public pages
import Home from "../pages/Home";
import AboutUs from "../pages/AboutUs";
import Products from "../pages/Products";
import Services from "../pages/Services";
import Industries from "../pages/Industries";
import Projects from "../pages/Projects";
import ProjectGallery from "../pages/ProjectGallery";
import KnowledgeCenter from "../pages/KnowledgeCenter";
import GetAQuote from "../pages/GetAQuote";
import ContactUs from "../pages/ContactUs";
import UpsCalculator from "../pages/UpsCalculator";
import BatteryCalculator from "../pages/BatteryCalculator";
import ThreePhaseUps from "../pages/ThreePhaseUps";
import AiPowerAssistant from "../pages/AiPowerAssistant";
import ServiceRequestManagement from "../pages/ServiceRequestManagement";
// Authentication
import PortalLogin from "../pages/PortalLogin";

// Customer portal
import CustomerDashboard from "../pages/CustomerDashboard";
import EquipmentDetails from "../pages/EquipmentDetails";
import ServiceHistorySchedule from "../pages/ServiceHistorySchedule";

// Admin
import AdminDashboard from "../pages/AdminDashboard";
import LeadManagement from "../pages/LeadManagement";
import LeadDetail from "../pages/LeadDetail";
import QuoteManagement from "../pages/QuoteManagement";
import EditQuotation from "../pages/EditQuotation";
import ServiceAmcManagement from "../pages/ServiceAmcManagement";

// Support
import ServiceRequestAmcEnquiry from "../pages/ServiceRequestAmcEnquiry";

// Protected routes
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          PUBLIC WEBSITE
      ========================== */}

      <Route path="/" element={<Home />} />

      <Route path="/about" element={<AboutUs />} />

      <Route path="/products" element={<Products />} />

      <Route path="/services" element={<Services />} />

      <Route path="/industries" element={<Industries />} />

      <Route path="/projects" element={<Projects />} />

      <Route
        path="/project-gallery"
        element={<ProjectGallery />}
      />

      <Route
        path="/knowledge"
        element={<KnowledgeCenter />}
      />

      <Route
        path="/quote"
        element={<GetAQuote />}
      />

      <Route
        path="/contact"
        element={<ContactUs />}
      />

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


      {/* =========================
          LOGIN
      ========================== */}

      <Route
        path="/portal/login"
        element={<PortalLogin />}
      />


      {/* =========================
          CUSTOMER PORTAL
      ========================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["customer"]} />
        }
      >

        {/* Customer Dashboard */}
        <Route
          path="/portal/dashboard"
          element={<CustomerDashboard />}
        />

        {/* Customer Equipment */}
        <Route
          path="/portal/equipment"
          element={<EquipmentDetails />}
        />

        {/* Customer Service History */}
        <Route
          path="/portal/service-history"
          element={<ServiceHistorySchedule />}
        />

      </Route>


      {/* =========================
          ADMIN PANEL
      ========================== */}

      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]} />
        }
      >

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* Lead Management */}
        <Route
          path="/admin/leads"
          element={<LeadManagement />}
        />

        {/* Lead Detail */}
        <Route
          path="/admin/leads/detail"
          element={<LeadDetail />}
        />

        {/* Quote Management */}
        <Route
          path="/admin/quotes"
          element={<QuoteManagement />}
        />

        {/* Edit Quotation */}
        <Route
          path="/admin/quotes/edit"
          element={<EditQuotation />}
        />

        {/* Service & AMC Management */}
        <Route
          path="/admin/service-amc"
          element={<ServiceAmcManagement />}
        />

      </Route>

      {/* Service Request Management */}
      <Route
        path="/admin/service-requests"
        element={<ServiceRequestManagement />}
      />


      {/* =========================
          SUPPORT
      ========================== */}

      <Route
        path="/support/amc-request"
        element={<ServiceRequestAmcEnquiry />}
      />


      {/* =========================
          REDIRECTS
      ========================== */}

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


      {/* =========================
          UNKNOWN URL
      ========================== */}

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