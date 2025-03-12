import { BASE_ID, API_KEY } from '../config.ts';

export default async function deleteComment(
  recordId,
  tableIdOrName,
  rowCommentId
) {
  const url = new URL(
    `https://api.airtable.com/v0/${BASE_ID}/${tableIdOrName}/${recordId}/comments/${rowCommentId}`
  );
  const response = await fetch(url.toString(), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });
  return await response.json();
}
