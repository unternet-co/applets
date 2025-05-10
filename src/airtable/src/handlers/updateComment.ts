import { BASE_ID, API_KEY } from '../config.ts';

export default async function updateComment(
  recordId,
  tableIdOrName,
  rowCommentId,
  text
) {
  const url = new URL(
    `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}/${recordId}/comments/${rowCommentId}`
  );
  const payload = { text };
  const response = await fetch(url.toString(), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}
