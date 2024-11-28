// mobile-ms-rewards.spec.js
import { test, chromium } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

async function runTestWithCredentials(page, browser, credentials) {
  const { email, password } = credentials[0];

  await page.goto('https://login.live.com/');
  await page.getByTestId('i0116').click();
  await page.getByTestId('i0116').fill(email);
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByTestId('i0118').fill(password);
  await page.getByTestId('textButtonContainer').getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Stay signed in?').click();
  await page.goto('https://www.bing.com/search?q=kimchi&form=QBLH&sp=-1&lq=0&pq=kimchi&sc=10-6&qs=n&sk=&cvid=268863FE9C02482CB595EFBE65E20450&ghsh=0&ghacc=0&ghpl=');
  
  const randomSearchTerms = Array.from({ length: 35 }, () => {
    const randomChoice = Math.floor(Math.random() * 5);
    switch (randomChoice) {
      case 0:
        return faker.word.noun();
      case 1:
        return faker.person.firstName();
      case 2:
        return faker.person.fullName();
      case 3:
        return faker.hacker.noun();
      case 4:
        return faker.company.buzzPhrase();
      default:
        return faker.word.noun();
    }
  });

  for (const term of randomSearchTerms) {
    await page.getByPlaceholder('Ask me anything...').fill(term);
    await page.getByPlaceholder('Ask me anything...').press('Enter');
    await page.waitForLoadState('networkidle');
    const delay = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
    await page.waitForTimeout(delay);
    await page.getByPlaceholder('Ask me anything...').click();
  }

  await page.close();

  if (credentials.length > 1) {
    credentials.shift();
    const newBrowser = await chromium.launch();
    const newPage = await newBrowser.newPage();
    await runTestWithCredentials(newPage, newBrowser, credentials);
  } else {
    console.log('Completed all tests.');
    await browser.close();
  }
}

test('playwrightrewarding-mobile', async ({ browser }) => {
  // Set up mobile viewport
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }, // iPhone 6/7/8 dimensions
    isMobile: true,
  });
  const page = await context.newPage();

  const credentials = await new Promise((resolve, reject) => {
    const creds = [];
    fs.createReadStream(path.join(__dirname, 'credentials.csv'))
      .pipe(csv())
      .on('data', (row) => {
        creds.push(row);
      })
      .on('end', () => {
        resolve(creds);
      })
      .on('error', (error) => {
        reject(error);
      });
  });

  await runTestWithCredentials(page, browser, credentials);
});