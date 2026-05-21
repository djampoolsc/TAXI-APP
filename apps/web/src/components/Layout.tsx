import React from 'react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  showLogo?: boolean;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  action,
  showLogo = true,
  transparent = false,
}) => {
  return (
    <header
      className={`
        ${transparent ? 'bg-transparent' : 'bg-white border-b border-orange-100 shadow-sm'}
        sticky top-0 z-50 transition-all
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {showLogo && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">Axiom</span>
            </div>
          )}

          {/* Title */}
          {title && (
            <div className="flex-1 ml-4">
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          )}

          {/* Action */}
          {action && <div>{action}</div>}
        </div>
      </div>
    </header>
  );
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  items: Array<{
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    onClick: () => void;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, items }) => {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static left-0 top-0 z-50
          w-64 h-screen
          bg-white border-r border-orange-100
          transition-transform duration-300 md:translate-x-0
          shadow-lg md:shadow-none
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 font-bold text-xl">Axiom</span>
            <button
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-2">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200
                ${
                  item.active
                    ? 'bg-orange-100 text-orange-600 border border-orange-300 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const MainLayout: React.FC<LayoutProps> = ({ children, header, sidebar }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Header */}
      {header && <div className="relative z-40">{header}</div>}

      {/* Main Content */}
      <div className="relative z-10 flex">
        {sidebar && <div>{sidebar}</div>}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
