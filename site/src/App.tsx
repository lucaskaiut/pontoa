import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartDrawerProvider } from "./contexts/CartDrawerContext";
import { CartProvider } from "./contexts/CartContext";
import { CartDrawer } from "./components/CartDrawer";
import BookingPage from "./pages/BookingPage";
import FirstAccessPage from "./pages/FirstAccessPage";
import LoginPage from "./pages/LoginPage";
import MyInfoPage from "./pages/MyInfoPage";
import ReviewsPage from "./pages/ReviewsPage";
import UserProfilePage from "./pages/UserProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PackagesPage from "./pages/PackagesPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderDetailPage from "./pages/OrderDetailPage";

function App() {
  return (
    <CartProvider>
      <CartDrawerProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<BookingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/primeiro-acesso/:token" element={<FirstAccessPage />} />
            <Route path="/minhas-informacoes" element={<MyInfoPage />} />
            <Route path="/minhas-avaliacoes" element={<ReviewsPage />} />
            <Route path="/carrinho" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/pacotes" element={<PackagesPage />} />
            <Route path="/meus-pedidos" element={<MyOrdersPage />} />
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
            <Route path="/pedido-confirmado/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/:url" element={<UserProfilePage />} />
          </Routes>
          <CartDrawer />
        </BrowserRouter>
      </CartDrawerProvider>
    </CartProvider>
  );
}

export default App;
