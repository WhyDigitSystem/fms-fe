// components/Tabs/Tabs.jsx
import React from 'react';
import { clsx } from 'clsx';

export const Tabs = ({ 
  tabs, 
  activeTab, 
  onTabChange,
  variant = 'default',
  className 
}) => {
  const variants = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
    underline: 'border-b border-gray-200 dark:border-gray-700'
  };

  const tabVariants = {
    default: {
      active: 'border-blue-500 text-blue-600 dark:text-blue-400',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
    },
    pills: {
      active: 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm',
      inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
    },
    underline: {
      active: 'border-blue-500 text-blue-600 dark:text-blue-400',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
    }
  };

  return (
    <nav className={clsx('flex space-x-8 overflow-x-auto', variants[variant], className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 py-3 px-1 font-medium text-sm whitespace-nowrap transition-all duration-200',
              variant === 'pills' && 'px-3 py-2 rounded-md transition-colors',
              variant === 'default' && 'border-b-2',
              variant === 'underline' && 'border-b-2',
              activeTab === tab.id 
                ? tabVariants[variant].active 
                : tabVariants[variant].inactive
            )}
          >
            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
            {tab.label}
            {tab.badge && (
              <span className={clsx(
                'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              )}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export const TabPanel = ({ children, active, className }) => {
  if (!active) return null;
  
  return (
    <div className={clsx('animate-fade-in', className)}>
      {children}
    </div>
  );
};