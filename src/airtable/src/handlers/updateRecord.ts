import { BASE_ID, API_KEY } from '../config.ts';

export default async function updateRecord(recordId, fields, tableIdOrName) {
  if (!recordId) {
    throw new Error('Record ID not provided');
  }
  if (!fields || typeof fields !== 'object') {
    throw new Error('Invalid fields provided for update');
  }
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}/${recordId}`;
  const payload = { fields };
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}
