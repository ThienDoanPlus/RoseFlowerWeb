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
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { GmailModal } from './components/GmailModal';
import { AuthModal } from './components/AuthModal';
import { TestRunnerModal } from './components/TestRunnerModal';
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

function AppContent() {
  const { state } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF5F7] text-stone-900 font-sans selection:bg-rose-200 selection:text-rose-900 pb-16 md:pb-0 overflow-x-hidden w-full max-w-full">
      {/* Promotional announcement banner */}
      <PromoBanner />

      {/* Adaptive Header Navigation */}
      <Navbar />

      {/* Main Content Sections based on Active View (Storefront, Staff Kanban, Admin Portal) */}
      <main className="flex-1">
        {state.activeView === 'staff' ? (
          <StaffOrderBoard />
        ) : state.activeView === 'admin' ? (
          <AdminDashboard />
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
      <GmailModal />
      <AuthModal />
      <TestRunnerModal />
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
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
