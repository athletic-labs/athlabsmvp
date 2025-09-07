'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSupabase } from '@/lib/supabase/client';

const ONBOARDING_STEPS = [
  { id: 'league', title: 'Select Your League' },
  { id: 'team', title: 'Choose Your Team' },
  { id: 'role', title: 'Your Role & Contact Info' },
  { id: 'nutrition', title: 'Team Nutritional Requirements' }
];

const LEAGUES = [
  { id: 'nfl', name: 'NFL', sport: 'Football' },
  { id: 'nba', name: 'NBA', sport: 'Basketball' },
  { id: 'nhl', name: 'NHL', sport: 'Hockey' },
  { id: 'mlb', name: 'MLB', sport: 'Baseball' },
  { id: 'mls', name: 'MLS', sport: 'Soccer' },
  { id: 'milb', name: 'MiLB', sport: 'Baseball' },
  { id: 'nwsl', name: 'NWSL', sport: 'Soccer' },
  { id: 'wnba', name: 'WNBA', sport: 'Basketball' }
];

const ROLES = [
  { id: 'registered_dietitian', label: 'Registered Dietitian' },
  { id: 'nutrition_coordinator', label: 'Nutrition Coordinator' },
  { id: 'team_manager', label: 'Team Manager' },
  { id: 'athletic_trainer', label: 'Athletic Trainer' },
  { id: 'other', label: 'Other' }
];

const NUTRITION_PRESETS = [
  { id: 'high-protein', name: 'High Protein', macros: { protein: 40, carbs: 30, fats: 30 } },
  { id: 'balanced', name: 'Balanced', macros: { protein: 30, carbs: 40, fats: 30 } },
  { id: 'performance', name: 'Performance', macros: { protein: 25, carbs: 50, fats: 25 } },
  { id: 'custom', name: 'Custom', macros: null }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    league: '',
    team: '',
    role: '',
    firstName: '',
    lastName: '',
    phone: '',
    nutritionPreset: '',
    customMacros: { protein: 33, carbs: 34, fats: 33 }
  });

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('profiles').update({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        role: formData.role,
        team_id: formData.team,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }).eq('id', user?.id);

      await supabase.from('teams').update({
        protein_target: formData.customMacros.protein,
        carbs_target: formData.customMacros.carbs,
        fats_target: formData.customMacros.fats,
        nutritional_preset: formData.nutritionPreset
      }).eq('id', formData.team);

      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-smoke/20 to-white dark:from-navy dark:to-navy/90">
      <div className="max-w-2xl mx-auto pt-12 px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {ONBOARDING_STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    idx <= currentStep 
                      ? 'text-white ring-4 ring-opacity-30' 
                      : 'bg-smoke dark:bg-smoke/30 text-navy/50 dark:text-white/50'
                  }`}
                  style={{
                    backgroundColor: idx <= currentStep ? 'var(--md-sys-color-primary)' : 'transparent',
                    fontWeight: 500
                  }}
                >
                  {idx < currentStep ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                {idx < ONBOARDING_STEPS.length - 1 && (
                  <div className={`h-1 w-full max-w-[100px] mx-2 transition-all duration-300
                    ${idx < currentStep ? 'bg-electric-blue' : 'bg-smoke dark:bg-smoke/30'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="md3-headline-medium mb-sm text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>{ONBOARDING_STEPS[currentStep].title}</h2>
            <p className="text-navy/60 dark:text-white/60">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="md-card"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {LEAGUES.map((league) => (
                    <button
                      key={league.id}
                      onClick={() => setFormData({...formData, league: league.id})}
                      className={`p-6 rounded-xl border-2 transition-all duration-200
                        ${formData.league === league.id
                          ? 'border-electric-blue bg-electric-blue/10 dark:bg-electric-blue/20'
                          : 'border-smoke dark:border-smoke/30 hover:border-electric-blue/50'}`}>
                      <div className="md3-headline-medium mb-sm text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>{league.name}</div>
                      <div className="text-sm text-navy/60 dark:text-white/60">{league.sport}</div>
                    </button>
                  ))}
                </div>
                <button onClick={handleNext} disabled={!formData.league}
                  className="md-filled-button w-full">Continue</button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <p className="text-center text-navy/60 dark:text-white/60">
                  Team selection would load based on selected league
                </p>
                <div className="flex gap-3">
                  <button onClick={handleBack} className="md-text-button flex-1">Back</button>
                  <button onClick={handleNext} className="md-filled-button flex-1">Continue</button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <label key={role.id} className={`p-3 rounded-lg border cursor-pointer transition-all duration-200
                      ${formData.role === role.id
                        ? 'border-electric-blue bg-electric-blue/10 dark:bg-electric-blue/20'
                        : 'border-smoke dark:border-smoke/30 hover:border-electric-blue/50'}`}>
                      <input
                        type="radio"
                        name="role"
                        value={role.id}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="sr-only"
                      />
                      <span className="md3-body-medium text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>{role.label}</span>
                    </label>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="md-text-field"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="md-text-field"
                  />
                </div>
                
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="md-text-field"
                />
                
                <div className="flex gap-3">
                  <button onClick={handleBack} className="md-text-button flex-1">Back</button>
                  <button onClick={handleNext} className="md-filled-button flex-1">Continue</button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {NUTRITION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          nutritionPreset: preset.id,
                          customMacros: preset.macros || formData.customMacros
                        });
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left
                        ${formData.nutritionPreset === preset.id
                          ? 'border-electric-blue bg-electric-blue/10 dark:bg-electric-blue/20'
                          : 'border-smoke dark:border-smoke/30 hover:border-electric-blue/50'}`}>
                      <div className="md3-body-large text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>{preset.name}</div>
                      {preset.macros && (
                        <div className="text-xs mt-2">
                          P: {preset.macros.protein}% | C: {preset.macros.carbs}% | F: {preset.macros.fats}%
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {formData.nutritionPreset === 'custom' && (
                  <div className="space-y-4 p-4 bg-smoke/10 dark:bg-smoke/20 rounded-lg">
                    {['protein', 'carbs', 'fats'].map((macro) => (
                      <div key={macro}>
                        <div className="flex justify-between mb-2">
                          <label className="md3-body-small text-[var(--md-sys-color-on-surface)] capitalize" style={{ fontWeight: 500 }}>{macro}</label>
                          <span className="md3-body-small text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 600 }}>
                            {formData.customMacros[macro as keyof typeof formData.customMacros]}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.customMacros[macro as keyof typeof formData.customMacros]}
                          onChange={(e) => setFormData({
                            ...formData,
                            customMacros: {
                              ...formData.customMacros,
                              [macro]: parseInt(e.target.value)
                            }
                          })}
                          className="w-full accent-electric-blue"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={handleBack} className="md-text-button flex-1">Back</button>
                  <button onClick={handleComplete} disabled={loading} className="md-filled-button flex-1">
                    {loading ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : 'Complete Setup'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}