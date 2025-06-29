// Comprehensive responsive testing page for Executive Dysfunction Center
// Tests all responsive and adaptive components across device sizes

import React, { useState } from 'react';
import { ResponsiveCard } from '../components/ui/ResponsiveCard';
import { ResponsiveNavigation } from '../components/ui/ResponsiveNavigation';
import { AdaptiveTypography } from '../components/ui/AdaptiveTypography';
import { TouchGesture } from '../components/ui/TouchGestures';
import CrossDeviceTestingPanel from '../components/testing/CrossDeviceTestingPanel';
import { useDeviceCapabilities } from '../utils/deviceCapabilities';
import { cn } from '../utils/cn';

interface ResponsiveTestPageProps {
  className?: string;
}

const ResponsiveTestPage: React.FC<ResponsiveTestPageProps> = ({ className }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showTestPanel, setShowTestPanel] = useState(false);
  const capabilities = useDeviceCapabilities();

  const testSections = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'cards', name: 'Responsive Cards', icon: '🃏' },
    { id: 'navigation', name: 'Navigation', icon: '🧭' },
    { id: 'typography', name: 'Typography', icon: '📰' },
    { id: 'touch', name: 'Touch Gestures', icon: '👆' },
    { id: 'testing', name: 'Device Testing', icon: '🔧' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <AdaptiveTypography variant="heading" level={1} className="text-center">
        Responsive Design Test Suite
      </AdaptiveTypography>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponsiveCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Device Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Type:</strong> {capabilities.isMobile ? 'Mobile' : capabilities.isTablet ? 'Tablet' : 'Desktop'}</div>
              <div><strong>Screen Size:</strong> {capabilities.screenSize}</div>
              <div><strong>Touch Support:</strong> {capabilities.hasTouch ? 'Yes' : 'No'}</div>
              <div><strong>Connection:</strong> {capabilities.connectionSpeed}</div>
              <div><strong>Cognitive Load:</strong> {capabilities.cognitiveLoadCapacity}</div>
              <div><strong>Reduced Motion:</strong> {capabilities.prefersReducedMotion ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </ResponsiveCard>
        
        <ResponsiveCard>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Adaptive Features</h3>
            <div className="space-y-2 text-sm">
              <div>✅ Container Queries: {capabilities.supportsContainerQueries ? 'Native' : 'Polyfill'}</div>
              <div>✅ Service Worker: {capabilities.supportsServiceWorker ? 'Available' : 'Not supported'}</div>
              <div>✅ WebP Images: {capabilities.supportsWebP ? 'Supported' : 'Fallback'}</div>
              <div>✅ PWA Features: {capabilities.supportsPWA ? 'Full support' : 'Limited'}</div>
              <div>✅ High Contrast: {capabilities.supportsHighContrast ? 'Available' : 'Standard'}</div>
            </div>
          </div>
        </ResponsiveCard>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Test on different screen sizes by resizing your browser window</li>
          <li>Check touch interactions on mobile devices</li>
          <li>Verify that container queries adapt components based on their container size</li>
          <li>Test with reduced motion preferences enabled</li>
          <li>Validate keyboard navigation and accessibility features</li>
          <li>Check performance on slower devices and connections</li>
        </ul>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="space-y-6">
      <AdaptiveTypography variant="heading" level={2}>Responsive Cards</AdaptiveTypography>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResponsiveCard>
          <div>
            <h3 className="font-semibold mb-2">Simple Card</h3>
            <p>This card adapts its layout based on container size.</p>
          </div>
        </ResponsiveCard>
        <ResponsiveCard variant="compact">
          <div>
            <h3 className="font-semibold mb-2">Compact Card</h3>
            <p>This card uses the compact variant.</p>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">Edit</button>
              <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
            </div>
          </div>
        </ResponsiveCard>
        <ResponsiveCard variant="expanded">
          <div>
            <h3 className="font-semibold mb-2">Expanded Card</h3>
            <p>This card contains complex content that reflows based on available space.</p>
            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              <div className="p-2 bg-gray-100 rounded">Metric 1: 85%</div>
              <div className="p-2 bg-gray-100 rounded">Metric 2: 72%</div>
              <div className="p-2 bg-gray-100 rounded">Metric 3: 91%</div>
              <div className="p-2 bg-gray-100 rounded">Metric 4: 68%</div>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="space-y-6">
      <AdaptiveTypography variant="heading" level={2}>Responsive Navigation</AdaptiveTypography>
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="mb-4 text-sm text-gray-600">
          Navigation adapts from desktop sidebar to mobile bottom nav to hamburger menu based on screen size.
        </p>
        <ResponsiveNavigation />
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="space-y-6">
      <AdaptiveTypography variant="heading" level={2}>Adaptive Typography</AdaptiveTypography>
      <div className="space-y-4">
        <AdaptiveTypography variant="heading" level={1}>Heading 1 - Scales with container</AdaptiveTypography>
        <AdaptiveTypography variant="heading" level={2}>Heading 2 - Responsive sizing</AdaptiveTypography>
        <AdaptiveTypography variant="heading" level={3}>Heading 3 - Container-aware</AdaptiveTypography>
        <AdaptiveTypography variant="body">
          Body text that adapts its size and line height based on the container width and reading context.
          This text becomes more readable on mobile devices with appropriate scaling.
        </AdaptiveTypography>
        <AdaptiveTypography variant="caption">
          Caption text that scales appropriately for different contexts and screen sizes.
        </AdaptiveTypography>
      </div>
    </div>
  );

  const renderTouchGestures = () => (
    <div className="space-y-6">
      <AdaptiveTypography variant="heading" level={2}>Touch Gestures</AdaptiveTypography>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="mb-4 text-sm text-gray-600">
          Touch gestures are enabled on touch devices. Try swiping, pinching, or long-pressing.
        </p>
        <TouchGesture
          onSwipeLeft={() => console.log('Swiped left')}
          onSwipeRight={() => console.log('Swiped right')}
          onTap={() => console.log('Tapped')}
          onLongPress={() => console.log('Long pressed')}
          className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center"
        >
          <div>
            <p className="text-lg font-semibold mb-2">Gesture Test Area</p>
            <p className="text-sm text-gray-600">Try touch gestures here</p>
          </div>
        </TouchGesture>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'cards': return renderCards();
      case 'navigation': return renderNavigation();
      case 'typography': return renderTypography();
      case 'touch': return renderTouchGestures();
      case 'testing': return <CrossDeviceTestingPanel />;
      default: return renderOverview();
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-100', className)}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Responsive Test Suite</h1>
            <button
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {showTestPanel ? 'Hide' : 'Show'} Test Panel
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {testSections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderSection()}
            </div>
          </main>
        </div>

        {/* Test Panel Overlay */}
        {showTestPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Device Testing Panel</h2>
                <button
                  onClick={() => setShowTestPanel(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
              <div className="p-4">
                <CrossDeviceTestingPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveTestPage;
