import React from 'react';
import { Tab } from '../types';

interface TabsProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onTabChange }) => {
  return (
    <div className="w-full">
      <div className="flex border-b border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-4 text-center text-lg font-medium transition-colors duration-300
              ${activeTabId === tab.id
                ? 'border-b-4 border-indigo-500 text-indigo-300'
                : 'text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.find((tab) => tab.id === activeTabId)?.content}
      </div>
    </div>
  );
};

export default Tabs;