import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_POLICY, PasswordStrengthCalculator } from '@/lib/auth/password-policy';

export async function GET(request: NextRequest) {
  try {
    // Return current password policy configuration
    return NextResponse.json({
      policy: DEFAULT_POLICY,
      info: {
        description: 'Enterprise-grade password policy based on NIST SP 800-63B guidelines',
        features: [
          'Minimum 12 character length',
          'Character complexity requirements',
          'Common password prevention',
          'User info prevention',
          'Password history checking',
          'Real-time strength calculation',
        ],
      },
    });
  } catch (error) {
    console.error('[Password Policy] Failed to get policy:', error);
    
    return NextResponse.json({
      error: 'Failed to retrieve password policy',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password, userInfo } = await request.json();
    
    if (!password) {
      return NextResponse.json({
        error: 'Password is required',
      }, { status: 400 });
    }

    // Validate password against policy
    const validation = PasswordStrengthCalculator.validate(
      password, 
      DEFAULT_POLICY, 
      userInfo
    );

    // Get strength description
    const strengthInfo = PasswordStrengthCalculator.getStrengthDescription(validation.score);

    return NextResponse.json({
      validation,
      strengthInfo,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Password Policy] Validation error:', error);
    
    return NextResponse.json({
      error: 'Password validation failed',
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { length = 16 } = await request.json();
    
    if (length < 8 || length > 128) {
      return NextResponse.json({
        error: 'Password length must be between 8 and 128 characters',
      }, { status: 400 });
    }

    // Generate secure password
    const generatedPassword = PasswordStrengthCalculator.generateSecurePassword(length);
    
    // Validate the generated password
    const validation = PasswordStrengthCalculator.validate(generatedPassword, DEFAULT_POLICY);
    const strengthInfo = PasswordStrengthCalculator.getStrengthDescription(validation.score);

    return NextResponse.json({
      password: generatedPassword,
      validation,
      strengthInfo,
      generated: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Password Policy] Generation error:', error);
    
    return NextResponse.json({
      error: 'Password generation failed',
    }, { status: 500 });
  }
}