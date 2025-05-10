import { BASE_ID, API_KEY } from '../config.ts';

export default async function listComments(
  recordId,
  tableIdOrName,
  pageSize,
  offset
) {
  const url = new URL(
    `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}/${recordId}/comments`
  );
  if (pageSize) {
    url.searchParams.append('pageSize', pageSize);
  }
  if (offset) {
    url.searchParams.append('offset', offset);
  }
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  return await response.json();
}
