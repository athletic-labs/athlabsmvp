'use client';

import { useState } from 'react';
import { User, Bell, CreditCard, Shield, Lock, Eye, EyeOff, Key, Smartphone, AlertCircle, Check, Plus, Trash2, Edit } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);

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
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span>Weekly nutrition reports</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span>Marketing and promotional emails</span>
              </label>
            </div>
            <button className="md-filled-button">Save Preferences</button>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Billing & Payment</h3>
              <button className="md-outlined-button flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>

            {/* Current Plan */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold">Team Premium Plan</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Up to 50 team members</p>
                </div>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">$299<span className="text-base font-normal text-gray-500">/month</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Billed monthly • Next billing: March 15, 2024</p>
                </div>
                <button className="md-outlined-button">Change Plan</button>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-semibold mb-4">Payment Methods</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/2027</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs">
                      Default
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center text-white text-xs font-bold">
                      MSTR
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 8888</p>
                      <p className="text-sm text-gray-500">Expires 08/2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing History */}
            <div>
              <h4 className="font-semibold mb-4">Recent Invoices</h4>
              <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">INV-2024-003</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Feb 15, 2024</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$299.00</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-500">Download</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">INV-2024-002</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jan 15, 2024</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">$299.00</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-500">Download</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Security Settings</h3>

            {/* Password Change */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-gray-500" />
                <h4 className="font-semibold">Change Password</h4>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Current Password"
                    className="md-text-field pr-12"
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    className="md-text-field pr-12"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    className="md-text-field pr-12"
                  />
                  <button
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">Password must contain:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      One special character
                    </li>
                  </ul>
                </div>
                <button className="md-filled-button">Update Password</button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-gray-500" />
                  <div>
                    <h4 className="font-semibold">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              {twoFactorEnabled && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                    Set up your authenticator app:
                  </p>
                  <ol className="text-sm space-y-2 text-blue-700 dark:text-blue-300">
                    <li>1. Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>2. Scan the QR code or enter the setup key</li>
                    <li>3. Enter the 6-digit code from your app</li>
                  </ol>
                  <div className="mt-4 flex gap-3">
                    <input
                      type="text"
                      placeholder="000000"
                      className="flex-1 px-3 py-2 border border-blue-200 dark:border-blue-800 rounded bg-white dark:bg-gray-800"
                      maxLength={6}
                    />
                    <button className="md-filled-button">Verify</button>
                  </div>
                </div>
              )}
            </div>

            {/* Login Notifications */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <h4 className="font-semibold">Login Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginNotifications}
                    onChange={(e) => setLoginNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Active Sessions */}
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-gray-500" />
                  <h4 className="font-semibold">Active Sessions</h4>
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Sign out all devices
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">MacBook Pro - Chrome</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      San Francisco, CA • Active now
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-sm">
                    Current
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div>
                    <p className="font-medium">iPhone - Safari</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      San Francisco, CA • 2 hours ago
                    </p>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm">
                    Sign out
                  </button>
                </div>
              </div>
            </div>

            {/* Account Danger Zone */}
            <div className="p-6 border-2 border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/10">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-red-800 dark:text-red-200">Danger Zone</h4>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                These actions are permanent and cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                  Export Account Data
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}