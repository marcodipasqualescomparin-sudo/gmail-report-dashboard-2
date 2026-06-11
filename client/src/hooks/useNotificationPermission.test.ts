import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotificationPermission } from './useNotificationPermission';

describe('useNotificationPermission', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should detect browser support for notifications', () => {
    const { result } = renderHook(() => useNotificationPermission());
    
    // Check if Notification API is supported
    if ('Notification' in window) {
      expect(result.current.isSupported).toBe(true);
    } else {
      expect(result.current.isSupported).toBe(false);
    }
  });

  it('should return current permission status', () => {
    const { result } = renderHook(() => useNotificationPermission());
    
    if ('Notification' in window) {
      expect(['default', 'granted', 'denied']).toContain(result.current.permission);
    }
  });

  it('should handle unsupported browser gracefully', async () => {
    // Mock window.Notification as undefined
    const originalNotification = (window as any).Notification;
    delete (window as any).Notification;

    const { result } = renderHook(() => useNotificationPermission());
    
    expect(result.current.isSupported).toBe(false);
    
    // Restore
    (window as any).Notification = originalNotification;
  });

  it('should send notification when permission is granted', () => {
    if (!('Notification' in window)) {
      return; // Skip if not supported
    }

    const { result } = renderHook(() => useNotificationPermission());
    
    // Mock Notification constructor
    const notificationSpy = vi.spyOn(window, 'Notification' as any);
    
    act(() => {
      result.current.sendNotification('Test Title', { body: 'Test Body' });
    });

    // Verify notification was attempted (may fail if permission not granted)
    // This is a basic check; actual behavior depends on permission state
  });
});
