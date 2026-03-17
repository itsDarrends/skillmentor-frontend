import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import AboutPage from "@/pages/AboutPage";
import ResourcesPage from "@/pages/ResourcesPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import CreateSubjectPage from "@/pages/admin/CreateSubjectPage";
import CreateMentorPage from "@/pages/admin/CreateMentorPage";
import ManageBookingsPage from "@/pages/admin/ManageBookingsPage";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";

function RoleRedirect() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  const roles = user?.publicMetadata?.roles as string[] | undefined;
  if (roles?.includes("ADMIN")) return <Navigate to="/admin/bookings" />;
  return <Navigate to="/dashboard" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
        <Route path="/about" element={<Layout><AboutPage /></Layout>} />
        <Route path="/resources" element={<Layout><ResourcesPage /></Layout>} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <SignedIn><DashboardPage /></SignedIn>
              <SignedOut><LoginPage /></SignedOut>
            </Layout>
          }
        />
        <Route
          path="/payment/:sessionId"
          element={
            <Layout>
              <SignedIn><PaymentPage /></SignedIn>
              <SignedOut><LoginPage /></SignedOut>
            </Layout>
          }
        />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/bookings" />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
          <Route path="mentors/create" element={<CreateMentorPage />} />
          <Route path="subjects/create" element={<CreateSubjectPage />} />
        </Route>
        <Route
          path="/redirect"
          element={<SignedIn><RoleRedirect /></SignedIn>}
        />
        <Route path="*" element={<Layout><LoginPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;