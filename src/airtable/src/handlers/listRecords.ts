import { BASE_ID, API_KEY } from '../config.ts';

export default async function listRecords(tableIdOrName) {
  let allRecords = [];
  let offset = null;
  try {
    do {
      const url = new URL(
        `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}`
      );
      if (offset) {
        url.searchParams.append('offset', offset);
      }
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${API_KEY}` },
      });
      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);
    return allRecords;
  } catch (error) {
    throw error;
  }
}
