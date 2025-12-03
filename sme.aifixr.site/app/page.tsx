'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import MainNavigation from '@/components/MainNavigation';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import BenefitsSection from '@/components/BenefitsSection';
import FloatingAIButton from '@/components/FloatingAIButton';
import LoginModal from '@/components/LoginModal';
import Footer from '@/components/Footer';
import { AutomatedReportView } from '@/components/AutomatedReportView';
import { ReportTemplateView } from '@/components/ReportTemplateView';
import { EditingView } from '@/components/EditingView';
import { createMainHandlers } from '@/services/mainservice';

export default function Home() {
  const [activeMainTab, setActiveMainTab] = useState('intro');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 이부분 임포트로 안 바꿔도 되는건가?
  const { handleLoginClick, handleLoginRequired, handleExplore, handleLogin } =
    createMainHandlers(setIsLoginModalOpen);

  // SPA 구조: activeMainTab에 따라 컨텐츠 전환
  if (activeMainTab === 'self-diagnosis') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header
          onLoginClick={handleLoginClick}
        />

        {/* Main Navigation */}
        <MainNavigation
          activeTab={activeMainTab}
          setActiveTab={setActiveMainTab}
          onLoginRequired={handleLoginRequired}
        />

        {/* 자가진단 뷰 */}
        <div className="pt-[140px]">
          <AutomatedReportView />
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  if (activeMainTab === 'auto-report') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header
          onLoginClick={handleLoginClick}
        />

        {/* Main Navigation */}
        <MainNavigation
          activeTab={activeMainTab}
          setActiveTab={setActiveMainTab}
          onLoginRequired={handleLoginRequired}
        />

        {/* 자동화 보고서 뷰 */}
        <div className="pt-[140px]">
          <ReportTemplateView />
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  if (activeMainTab === 'editing') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <Header
          onLoginClick={handleLoginClick}
        />

        {/* Main Navigation */}
        <MainNavigation
          activeTab={activeMainTab}
          setActiveTab={setActiveMainTab}
          onLoginRequired={handleLoginRequired}
        />

        {/* 윤문 AI 뷰 */}
        <div className="pt-[140px]">
          <EditingView />
        </div>

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        onLoginClick={handleLoginClick}
      />

      {/* Main Navigation */}
      <MainNavigation
        activeTab={activeMainTab}
        setActiveTab={setActiveMainTab}
        onLoginRequired={handleLoginRequired}
      />

      {/* Hero Section */}
      <HeroSection
        onExplore={handleExplore}
        onLogin={handleLoginClick}
      />

      {/* Feature Section */}
      <div id="features">
        <FeatureSection />
      </div>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
}

