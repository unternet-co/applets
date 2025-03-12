import { BASE_ID, API_KEY } from '../config.ts';

export default async function createRecord(fields, tableIdOrName) {
  if (!fields || typeof fields !== 'object') {
    throw new Error('Invalid record fields provided');
  }
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}`;
  const payload = { fields };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  // Handle response that may return a records array.
  return result.records && result.records.length > 0
    ? result.records[0]
    : result;
}
