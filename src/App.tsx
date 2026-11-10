/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './store';
import { PromoBanner } from './components/PromoBanner';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CatalogSection } from './components/CatalogSection';
import { VoucherSection } from './components/VoucherSection';
import { CraftSection } from './components/CraftSection';
import { GoogleMapsSection } from './components/GoogleMapsSection';
import { Footer } from './components/Footer';
import { FlowerDetailModal } from './components/FlowerDetailModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AuthModal } from './components/AuthModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { ZaloChatWidget } from './components/ZaloChatWidget';
import { AutoTopButton } from './components/AutoTopButton';
import { MobileBottomBar } from './components/MobileBottomBar';
import { Toast } from './components/Toast';

// Staff & Admin components
import { StaffOrderBoard } from './components/staff/StaffOrderBoard';
import { PrintCardModal } from './components/staff/PrintCardModal';
import { OrderStatusUpdater } from './components/staff/OrderStatusUpdater';
import { CustomerChatDrawer } from './components/staff/CustomerChatDrawer';
import { AdminDashboard } from './components/admin/AdminDashboard';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('rose_active_voucher');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF5F7] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
            <span className="text-2xl font-serif">R</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif text-rose-950 font-bold mb-2">
            Rose Flowers - Đang làm mới dữ liệu
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mb-6 leading-relaxed">
            Hệ thống đã tự động khôi phục dữ liệu an toàn. Vui lòng bấm nút bên dưới để xem đầy đủ bộ sưu tập hoa sáp 294 Phạm Văn Bạch.
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-2.5 bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            Về Trang Chủ Cửa Hàng
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { state } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F7] text-stone-900 font-sans selection:bg-rose-200 selection:text-rose-900 pb-16 md:pb-0 w-full max-w-full">
      {/* Promotional announcement banner */}
      <PromoBanner />

      {/* Adaptive Header Navigation */}
      <Navbar />

      {/* Main Content Sections based on Active View (Storefront, Product Detail, Staff Kanban, Admin Portal) */}
      <main className="flex-1">
        {state.activeView === 'staff' ? (
          <StaffOrderBoard />
        ) : state.activeView === 'admin' ? (
          <AdminDashboard />
        ) : state.activeView === 'product-detail' && state.productPageFlower ? (
          <ProductDetailPage flower={state.productPageFlower} />
        ) : (
          <>
            {/* Hero Section with featured boutique design */}
            <HeroSection />

            {/* Filterable Flower Catalog with search, occasions & sorting */}
            <CatalogSection />

            {/* Special Holiday & Bulk Order Vouchers */}
            <VoucherSection />

            {/* Botanical Philosophy & Artisanal Craft */}
            <CraftSection />

            {/* Interactive Google Maps Store Branches & Delivery Fee Calculator */}
            <GoogleMapsSection />
          </>
        )}
      </main>

      {/* Editorial Footer */}
      <Footer />

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomBar />

      {/* Modals & Slide-over Drawers */}
      <FlowerDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderSuccessModal />
      <OrderTrackingModal />
      <AuthModal />
      <AccountSettingsModal />
      <ZaloChatWidget />
      <AutoTopButton />
      <Toast />

      {/* Staff & Admin Modals */}
      <PrintCardModal />
      <OrderStatusUpdater />
      <CustomerChatDrawer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </ErrorBoundary>
  );
}
