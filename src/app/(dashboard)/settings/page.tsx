'use client';

import { useState } from 'react';
import { User, Bell, CreditCard, Shield, Lock, Eye, EyeOff, Key, Smartphone, AlertCircle, Check, Plus, Trash2, Edit, Palette } from 'lucide-react';
import { Card, Button, ThemeSelector, Switch, IconButton } from '@/lib/design-system/components';
import { TextFieldV2 } from '@/lib/design-system/components/TextFieldV2';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">Settings</h1>
        <p className="md3-body-large text-[var(--md-sys-color-on-surface-variant)] mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Card variant="filled" className="p-6">
        <div className="border-b border-[var(--md-sys-color-outline-variant)] mb-6">
          <nav className="flex space-x-8">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 border-b-2 transition-colors md3-label-large
                    ${activeTab === tab.id
                      ? 'border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)]'
                      : 'border-transparent text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'}`}
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
            <h3 className="md3-headline-small font-semibold text-[var(--md-sys-color-on-surface)]">Profile Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <TextFieldV2 
                label="First Name"
                placeholder="Enter your first name"
                variant="outlined"
                fullWidth
              />
              <TextFieldV2 
                label="Last Name"
                placeholder="Enter your last name"
                variant="outlined"
                fullWidth
              />
            </div>
            <TextFieldV2 
              type="email" 
              label="Email Address"
              placeholder="Enter your email address"
              variant="outlined"
              fullWidth
            />
            <TextFieldV2 
              type="tel" 
              label="Phone Number"
              placeholder="Enter your phone number"
              variant="outlined"
              fullWidth
            />
            <Button variant="filled">Save Changes</Button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="md3-headline-small font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
                Appearance & Theme
              </h3>
              <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
                Customize the look and feel of your workspace. Changes apply instantly and are saved automatically.
              </p>
            </div>
            
            <ThemeSelector 
              showModeToggle={true}
              showCustomThemeCreator={true}
              className="max-w-2xl"
            />
            
            <Card variant="outlined" className="p-4">
              <h4 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)] mb-3">
                Additional Display Options
              </h4>
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                      Reduce animations
                    </div>
                    <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      Minimize motion for better performance and accessibility
                    </div>
                  </div>
                  <Switch />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                      High contrast mode
                    </div>
                    <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      Increase contrast for better visibility
                    </div>
                  </div>
                  <Switch />
                </label>
                <label className="flex items-center justify-between">
                  <div>
                    <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                      Compact density
                    </div>
                    <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      Show more content with tighter spacing
                    </div>
                  </div>
                  <Switch />
                </label>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="md3-headline-small font-semibold text-[var(--md-sys-color-on-surface)]">Notification Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                    Email notifications for order updates
                  </div>
                  <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                    Get notified about order status changes
                  </div>
                </div>
                <Switch defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                    SMS notifications for delivery confirmations
                  </div>
                  <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                    Text messages when orders are delivered
                  </div>
                </div>
                <Switch />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                    Weekly nutrition reports
                  </div>
                  <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                    Weekly summary of your nutrition intake
                  </div>
                </div>
                <Switch defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <div className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                    Marketing and promotional emails
                  </div>
                  <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                    Special offers and product updates
                  </div>
                </div>
                <Switch />
              </label>
            </div>
            <Button variant="filled">Save Preferences</Button>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="md3-headline-small font-semibold text-[var(--md-sys-color-on-surface)]">Billing & Payment</h3>
              <Button variant="outlined" leftIcon={<Plus className="w-4 h-4" />}>
                Add Payment Method
              </Button>
            </div>

            {/* Current Plan */}
            <Card variant="filled" className="p-6 bg-gradient-to-r from-[var(--md-sys-color-primary-container)] to-[var(--md-sys-color-secondary-container)]">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="md3-title-large font-semibold text-[var(--md-sys-color-on-primary-container)]">Team Premium Plan</h4>
                  <p className="md3-body-small text-[var(--md-sys-color-on-primary-container)]/80">Up to 50 team members</p>
                </div>
                <span className="px-3 py-1 bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] rounded-full md3-label-medium font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="md3-display-small font-bold text-[var(--md-sys-color-on-primary-container)]">$299<span className="md3-body-large font-normal text-[var(--md-sys-color-on-primary-container)]/60">/month</span></p>
                  <p className="md3-body-small text-[var(--md-sys-color-on-primary-container)]/80">Billed monthly • Next billing: March 15, 2024</p>
                </div>
                <Button variant="outlined" className="border-[var(--md-sys-color-on-primary-container)] text-[var(--md-sys-color-on-primary-container)]">
                  Change Plan
                </Button>
              </div>
            </Card>

            {/* Payment Methods */}
            <div>
              <h4 className="md3-title-medium font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Payment Methods</h4>
              <div className="space-y-3">
                <Card variant="outlined" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-[var(--md-sys-color-primary)] rounded-[var(--md-sys-shape-corner-extra-small)] flex items-center justify-center text-[var(--md-sys-color-on-primary)] md3-label-small font-bold">
                        VISA
                      </div>
                      <div>
                        <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">•••• •••• •••• 4242</p>
                        <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Expires 12/2027</p>
                      </div>
                      <span className="px-2 py-1 bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] rounded-[var(--md-sys-shape-corner-extra-small)] md3-label-small font-medium">
                        Default
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconButton variant="standard" icon={<Edit className="w-4 h-4" />} aria-label="Edit payment method" className="text-[var(--md-sys-color-on-surface-variant)]" />
                      <IconButton variant="standard" icon={<Trash2 className="w-4 h-4" />} aria-label="Delete payment method" className="text-[var(--md-sys-color-error)]" />
                    </div>
                  </div>
                </Card>
                
                <Card variant="outlined" className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-[var(--md-sys-color-surface-variant)] rounded-[var(--md-sys-shape-corner-extra-small)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)] md3-label-small font-bold">
                        MSTR
                      </div>
                      <div>
                        <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">•••• •••• •••• 8888</p>
                        <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Expires 08/2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconButton variant="standard" icon={<Edit className="w-4 h-4" />} aria-label="Edit payment method" className="text-[var(--md-sys-color-on-surface-variant)]" />
                      <IconButton variant="standard" icon={<Trash2 className="w-4 h-4" />} aria-label="Delete payment method" className="text-[var(--md-sys-color-error)]" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Billing History */}
            <div>
              <h4 className="md3-title-medium font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Recent Invoices</h4>
              <Card variant="outlined" className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[var(--md-sys-color-surface-container-highest)]">
                    <tr>
                      <th className="px-6 py-3 text-left md3-label-small font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left md3-label-small font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left md3-label-small font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left md3-label-small font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left md3-label-small font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[var(--md-sys-color-surface)] divide-y divide-[var(--md-sys-color-outline-variant)]">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">INV-2024-003</td>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Feb 15, 2024</td>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small text-[var(--md-sys-color-on-surface)]">$299.00</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex md3-label-small font-semibold rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small font-medium">
                        <Button variant="text" className="text-[var(--md-sys-color-primary)]">
                          Download
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small font-medium text-[var(--md-sys-color-on-surface)]">INV-2024-002</td>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Jan 15, 2024</td>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small text-[var(--md-sys-color-on-surface)]">$299.00</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex md3-label-small font-semibold rounded-full bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap md3-body-small font-medium">
                        <Button variant="text" className="text-[var(--md-sys-color-primary)]">
                          Download
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="md3-headline-small font-semibold text-[var(--md-sys-color-on-surface)]">Security Settings</h3>

            {/* Password Change */}
            <Card variant="outlined" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />
                <h4 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">Change Password</h4>
              </div>
              <div className="space-y-4">
                <TextFieldV2
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Current Password"
                  placeholder="Enter current password"
                  variant="outlined"
                  fullWidth
                  trailingIcon={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                />
                <TextFieldV2
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  placeholder="Enter new password"
                  variant="outlined"
                  fullWidth
                  trailingIcon={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                />
                <TextFieldV2
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  variant="outlined"
                  fullWidth
                  trailingIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  }
                />
                <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                  <p className="mb-2">Password must contain:</p>
                  <ul className="space-y-1 ml-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[var(--md-sys-color-tertiary)]" />
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[var(--md-sys-color-tertiary)]" />
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
                      One number
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
                      One special character
                    </li>
                  </ul>
                </div>
                <Button variant="filled">Update Password</Button>
              </div>
            </Card>

            {/* Two-Factor Authentication */}
            <Card variant="outlined" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />
                  <div>
                    <h4 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">Two-Factor Authentication</h4>
                    <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                />
              </div>
              {twoFactorEnabled && (
                <div className="mt-4 p-4 bg-[var(--md-sys-color-primary-container)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <p className="md3-body-small text-[var(--md-sys-color-on-primary-container)] mb-3">
                    Set up your authenticator app:
                  </p>
                  <ol className="md3-body-small space-y-2 text-[var(--md-sys-color-on-primary-container)]">
                    <li>1. Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>2. Scan the QR code or enter the setup key</li>
                    <li>3. Enter the 6-digit code from your app</li>
                  </ol>
                  <div className="mt-4 flex gap-3">
                    <TextFieldV2
                      type="text"
                      placeholder="000000"
                      variant="outlined"
                      maxLength={6}
                      className="flex-1"
                    />
                    <Button variant="filled">Verify</Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Login Notifications */}
            <Card variant="outlined" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />
                  <div>
                    <h4 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">Login Notifications</h4>
                    <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                </div>
                <Switch
                  checked={loginNotifications}
                  onChange={(e) => setLoginNotifications(e.target.checked)}
                />
              </div>
            </Card>

            {/* Active Sessions */}
            <Card variant="outlined" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />
                  <h4 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)]">Active Sessions</h4>
                </div>
                <Button variant="text" className="text-[var(--md-sys-color-error)]">
                  Sign out all devices
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[var(--md-sys-color-surface-container-lowest)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <div>
                    <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">MacBook Pro - Chrome</p>
                    <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      San Francisco, CA • Active now
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] rounded-full md3-label-small font-medium">
                    Current
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--md-sys-color-surface-container-lowest)] rounded-[var(--md-sys-shape-corner-medium)]">
                  <div>
                    <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">iPhone - Safari</p>
                    <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      San Francisco, CA • 2 hours ago
                    </p>
                  </div>
                  <Button variant="text" className="text-[var(--md-sys-color-error)] md3-label-small">
                    Sign out
                  </Button>
                </div>
              </div>
            </Card>

            {/* Account Danger Zone */}
            <Card variant="outlined" className="p-6 border-2 border-[var(--md-sys-color-error)] bg-[var(--md-sys-color-error-container)]">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-[var(--md-sys-color-error)]" />
                <h4 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-error-container)]">Danger Zone</h4>
              </div>
              <p className="md3-body-small text-[var(--md-sys-color-on-error-container)] mb-4">
                These actions are permanent and cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outlined" 
                  className="border-[var(--md-sys-color-error)] text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error)]/8"
                >
                  Export Account Data
                </Button>
                <Button 
                  variant="filled" 
                  className="bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] hover:bg-[var(--md-sys-color-error)]/90"
                >
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
}