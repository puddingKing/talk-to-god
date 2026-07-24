import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GalleryPage from "./pages/GalleryPage";
import PhilosopherDetailPage from "./pages/PhilosopherDetailPage";
import ConversationsPage from "./pages/ConversationsPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminPhilosophersPage from "./pages/admin/AdminPhilosophersPage";
import AdminPhilosopherEditPage from "./pages/admin/AdminPhilosopherEditPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserEditPage from "./pages/admin/AdminUserEditPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/philosopher/:id" element={<PhilosopherDetailPage />} />
        <Route path="/conversations" element={<ConversationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/chat/:id" element={<ChatPage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/philosophers" element={<AdminPhilosophersPage />} />
      <Route path="/admin/philosophers/:id" element={<AdminPhilosopherEditPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/users/:id" element={<AdminUserEditPage />} />
    </Routes>
  );
}
