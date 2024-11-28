import { test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { chromium } from '@playwright/test';

async function runTestWithCredentials(page, browser, credentials) {
  // Assuming the first row contains the email and password
  const { email, password } = credentials[0];

  await page.goto('https://login.live.com/');
  await page.getByTestId('i0116').click();
  await page.getByTestId('i0116').fill(email); // Use email from CSV
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByTestId('i0118').fill(password); // Use password from CSV
  await page.getByTestId('textButtonContainer').getByRole('button', { name: 'Sign in' }).click();
  await page.getByLabel('Stay signed in?').click();
  await page.goto('https://www.bing.com/search?q=kimchi&form=QBLH&sp=-1&lq=0&pq=kimchi&sc=10-6&qs=n&sk=&cvid=268863FE9C02482CB595EFBE65E20450&ghsh=0&ghacc=0&ghpl=');
  
  // Generating random search terms (2 terms)
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
    
    // Wait for the search results to load
    await page.waitForLoadState('networkidle');
    
    // Random delay between 2 to 5 seconds between searches
    const delay = Math.floor(Math.random() * (5000 - 2000 + 1) + 2000);
    await page.waitForTimeout(delay);
    
    await page.getByPlaceholder('Ask me anything...').click();
  }

  // After completing the actions with the current credentials
  await page.close(); // Close the current page

  // Check if there are more credentials
  if (credentials.length > 1) {
    // Remove the used credentials
    credentials.shift(); // Remove the first element
    // Reopen the browser and start the test with the next credentials
    const newBrowser = await chromium.launch(); // Assuming you're using chromium
    const newPage = await newBrowser.newPage();
    
    // Call the test function with the new page and remaining credentials
    await runTestWithCredentials(newPage, newBrowser, credentials); // Pass the new browser instance
  } else {
    console.log('Completed all tests.'); // Log completion message
    await browser.close(); // Close the last browser instance
  }
}

test('playwrightrewarding', async ({ page, browser }) => {
  // Read credentials from CSV
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

  // Call the test function with the initial page and browser
  await runTestWithCredentials(page, browser, credentials);
});