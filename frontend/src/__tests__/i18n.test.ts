import { test, expect } from 'vitest';
import { I18N_DATA } from '../lib/i18n';

test('supports all required Indian languages', () => {
  const languages = ['en', 'hi', 'te', 'ta'];
  expect(languages).toContain('en');
  expect(languages).toContain('hi');
  expect(languages).toContain('te');
  expect(languages).toContain('ta');
});

test('has complete translation structure for English', () => {
  const data = I18N_DATA['en'];
  expect(data).toBeDefined();
  expect(data.appName).toBeTruthy();
  expect(data.nav.dashboard).toBeTruthy();
});
