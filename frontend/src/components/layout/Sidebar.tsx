import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Server, 
  AlertCircle, 
  Plus, 
  Radio, 
  X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      to: '/applications',
      label: 'Applications',
      icon: Server,
    },
    {
      to: '/incidents',
      label: 'Incidents',
      icon: AlertCircle,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[68px] border-r border-[#EAEAEA] bg-white flex flex-col items-center py-5 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 !w-64 !items-stretch !px-4' : '-translate-x-full'
        }`}
      >
        {/* Top section: Logo & Nav */}
        <div className="flex flex-col items-center w-full gap-6">
          {/* Logo & Mobile Close */}
          <div className="flex items-center justify-between w-full px-2 lg:px-0 lg:justify-center">
            <NavLink
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 group focus:outline-none"
              title="StatusSphere"
            >
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              {isOpen && (
                <div className="lg:hidden">
                  <span className="text-sm font-semibold tracking-tight text-neutral-900 block">
                    StatusSphere
                  </span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Monitoring platform
                  </span>
                </div>
              )}
            </NavLink>

            {isOpen && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 lg:hidden"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Add CTA */}
          <div className="w-full flex justify-center px-1">
            <NavLink
              to="/applications/new"
              onClick={onClose}
              className={`flex items-center justify-center w-9 h-9 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-subtle focus:outline-none ${
                isOpen ? '!w-full !justify-start !px-3 gap-2.5 text-xs font-medium h-9' : ''
              }`}
              title="Add application"
            >
              <Plus className="w-4 h-4 shrink-0" />
              {isOpen && <span className="lg:hidden">New application</span>}
            </NavLink>
          </div>

          <div className="w-6 h-[1px] bg-neutral-100 hidden lg:block" />

          {/* Navigation Items */}
          <nav className="flex flex-col items-center w-full gap-1.5 px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-center w-9 h-9 rounded-xl text-sm transition-all duration-150 focus:outline-none ${
                      isOpen ? '!w-full !justify-start !px-3 gap-3 h-9' : ''
                    } ${
                      isActive
                        ? 'bg-neutral-100 text-neutral-900 font-medium'
                        : 'text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50'
                    }`
                  }
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {isOpen && <span className="text-xs font-medium text-neutral-700 lg:hidden">{item.label}</span>}

                  {/* Desktop Tooltip */}
                  {!isOpen && (
                    <span className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-[11px] font-medium rounded-md shadow-dropdown whitespace-nowrap z-50 pointer-events-none">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
