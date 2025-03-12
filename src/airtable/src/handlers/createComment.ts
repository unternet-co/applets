import { BASE_ID, API_KEY } from '../config.ts';

export default async function createComment(
  recordId,
  tableIdOrName,
  text,
  parentCommentId
) {
  const url = new URL(
    `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}/${recordId}/comments`
  );
  const payload = <{ text: string; parentCommentId?: string }>{ text };
  if (parentCommentId) {
    payload.parentCommentId = parentCommentId;
  }
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return await response.json();
}
