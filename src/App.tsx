import { BrowserRouter, Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import PaymentPage from "@/pages/PaymentPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import CreateSubjectPage from "@/pages/admin/CreateSubjectPage";
import CreateMentorPage from "@/pages/admin/CreateMentorPage";
import ManageBookingsPage from "@/pages/admin/ManageBookingsPage";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/login" element={<Layout><LoginPage /></Layout>} />
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
          <Route path="subjects/create" element={<CreateSubjectPage />} />
          <Route path="mentors/create" element={<CreateMentorPage />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
        </Route>
        <Route path="*" element={<Layout><LoginPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;