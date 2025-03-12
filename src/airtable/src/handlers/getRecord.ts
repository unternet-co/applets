import { BASE_ID, API_KEY } from '../config.ts';

export default async function getRecord(recordId, tableIdOrName) {
  if (!recordId) {
    throw new Error('Record ID not provided');
  }
  const url = `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}/${recordId}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return await response.json();
}
