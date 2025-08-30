'use client';

import { useState } from 'react';
import { User, Bell, CreditCard, Shield } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-white">Settings</h1>
        <p className="text-navy/60 dark:text-white/60 mt-1">
          Manage your account and preferences
        </p>
      </div>

      <div className="md-card">
        <div className="border-b border-smoke dark:border-smoke/30 mb-6">
          <nav className="flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-electric-blue text-electric-blue'
                      : 'border-transparent text-navy/60 dark:text-white/60 hover:text-navy dark:hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Profile Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="md-text-field" />
              <input type="text" placeholder="Last Name" className="md-text-field" />
            </div>
            <input type="email" placeholder="Email Address" className="md-text-field" />
            <input type="tel" placeholder="Phone Number" className="md-text-field" />
            <button className="md-filled-button">Save Changes</button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span>Email notifications for order updates</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span>SMS notifications for delivery confirmations</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}