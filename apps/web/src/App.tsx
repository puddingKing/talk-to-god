import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GalleryPage from "./pages/GalleryPage";
import PhilosopherDetailPage from "./pages/PhilosopherDetailPage";
import ConversationsPage from "./pages/ConversationsPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";

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
    </Routes>
  );
}
