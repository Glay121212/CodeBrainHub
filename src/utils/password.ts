import { PasswordStrength } from '../types';

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  let passedCount = 0;
  if (hasMinLength) passedCount++;
  if (hasUpper) passedCount++;
  if (hasLower) passedCount++;
  if (hasNumber) passedCount++;
  if (hasSpecial) passedCount++;

  // Extra points for longer length
  let score = Math.floor((passedCount / 5) * 80);
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  let label: PasswordStrength['label'] = 'VERY WEAK';
  if (score >= 90) label = 'SECURE';
  else if (score >= 80) label = 'STRONG';
  else if (score >= 60) label = 'MODERATE';
  else if (score >= 40) label = 'WEAK';

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    score,
    label,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid,
  };
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}
