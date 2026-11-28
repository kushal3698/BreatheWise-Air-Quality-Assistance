import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('BreatheWise Core E2E Flow & Accessibility Audit', () => {
  test('search city -> edit household modal & Escape focus restore -> verify caution & interactive impact -> chat -> a11y', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Initial load & accessibility check (no critical or serious WCAG violations)
    await expect(page.getByText('BreatheWise').first()).toBeVisible();
    const initialA11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const blockingInitial = initialA11y.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(blockingInitial).toEqual([]);

    // 2. Search and switch city to Guntur
    const desktopSearch = page.getByRole('textbox', { name: 'Search city name' }).first();
    await desktopSearch.fill('Guntur');
    await page.getByRole('button', { name: 'Submit city search' }).first().click();
    await expect(page.getByText(/Switched to.*Guntur/i)).toBeVisible();

    // 3. Open Household Profile modal -> check role="dialog", add asthma sensitivity, test Escape + focus restoration
    const modalBtn = page.getByRole('button', { name: /Edit Household Profile/i });
    await modalBtn.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const addChildBtn = dialog.getByRole('button', { name: '+ Child' });
    await addChildBtn.click();
    const addAsthmaBtn = dialog.getByRole('button', { name: '+ Add Asthma' }).first();
    if (await addAsthmaBtn.isVisible()) {
      await addAsthmaBtn.click();
    }

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(modalBtn).toBeFocused();

    // 4. Switch to Daily Action Plan tab -> verify inhaler caution banner & Interactive Direct Impact Simulator
    await page.getByRole('tab', { name: /Daily Action Plan/i }).click();
    await expect(page.locator('#panel-planner').getByRole('alert')).toContainText(/inhalers/i);

    const checkboxes = page.locator('#panel-planner input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    expect(checkboxCount).toBeGreaterThan(2);

    const exposureMetric = page
      .locator('#panel-planner')
      .getByText('Average exposure reduction today')
      .locator('..')
      .locator('.text-3xl');
    const initialExposureText = await exposureMetric.textContent();
    await checkboxes.first().uncheck();
    await expect(exposureMetric).not.toHaveText(initialExposureText ?? '');

    // 5. Switch to GenAI Assistant tab -> send query -> verify reply & medical disclaimer
    await page.getByRole('tab', { name: /GenAI Assistant/i }).click();
    const chatInput = page.getByRole('textbox', { name: /Ask BreatheWise assistant/i });
    await chatInput.fill('Should my 8-year-old play outside at 4 PM?');
    await page.getByRole('button', { name: 'Send chat message' }).click();

    await expect(page.locator('#panel-chat')).toContainText('Should my 8-year-old play outside at 4 PM?');
    await expect(page.locator('#panel-chat .rounded-tl-none').nth(1)).toContainText(/indoor|window|aqi|pm2\.5|air/i, {
      timeout: 10000,
    });
    await expect(page.locator('footer')).toContainText(/not medical advice|decision-support/i);
  });
});
