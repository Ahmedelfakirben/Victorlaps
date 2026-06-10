import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './lib/i18n';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import PublicLayout from './components/public/PublicLayout';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import HelpCenter from './pages/public/HelpCenter';
import Updates from './pages/public/Updates';
import Features from './pages/public/Features';
import HowItWorks from './pages/public/HowItWorks';
import Pricing from './pages/public/Pricing';
import Blog from './pages/public/Blog';
import Tutorials from './pages/public/Tutorials';
import ApiDocs from './pages/public/ApiDocs';
import WebsiteBuilder from './pages/WebsiteBuilder';
import StorefrontHome from './pages/storefront/StorefrontHome';
import StorefrontVehicle from './pages/storefront/StorefrontVehicle';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import VehicleDetail from './pages/VehicleDetail';
import Planning from './pages/Planning';
import Contracts from './pages/Contracts';
import ContractDetail from './pages/ContractDetail';
import ContractCreate from './pages/ContractCreate';
import ContractPrint from './pages/ContractPrint';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Finance from './pages/Finance';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoicePrint from './pages/InvoicePrint';
import Morocco from './pages/Morocco';
import Settings from './pages/Settings';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Expired from './pages/Expired';
import SuperAdmin from './pages/SuperAdmin';

import Preloader from './components/layout/Preloader';

function App() {
  return (
    <BrowserRouter>
      <Preloader />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Subpages */}
        <Route element={<PublicLayout />}>
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/api" element={<ApiDocs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/updates" element={<Updates />} />
        </Route>

        {/* Protected Area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/fleet/:id" element={<VehicleDetail />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/new" element={<ContractCreate />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
            <Route path="/contracts/:id/print" element={<ContractPrint />} />
            <Route path="/crm" element={<Clients />} />
            <Route path="/crm/:id" element={<ClientDetail />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/finance/invoice/new" element={<InvoiceCreate />} />
            <Route path="/invoices/:id/print" element={<InvoicePrint />} />
            <Route path="/morocco" element={<Morocco />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/website-builder" element={<WebsiteBuilder />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Public Storefront Routes (Outside of normal layout) */}
        <Route path="/booking/:slug" element={<StorefrontHome />} />
        <Route path="/booking/:slug/vehicle/:id" element={<StorefrontVehicle />} />

        {/* Global Blocked Page */}
        <Route path="/expired" element={<Expired />} />

        {/* SuperAdmin Area */}
        <Route element={<ProtectedRoute requireSuperAdmin />}>
          <Route path="/superadmin" element={<SuperAdmin />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
