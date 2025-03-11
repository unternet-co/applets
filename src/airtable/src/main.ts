// main.js
import { applets } from '@web-applets/sdk';
import listRecords from './handlers/listRecords.ts';
import getRecord from './handlers/getRecord.ts';
import createRecord from './handlers/createRecord.ts';
import updateRecord from './handlers/updateRecord.ts';
import deleteRecord from './handlers/deleteRecord.ts';
import listComments from './handlers/listComments.ts';
import createComment from './handlers/createComment.ts';
import updateComment from './handlers/updateComment.ts';
import deleteComment from './handlers/deleteComment.ts';

const context = applets.register();

// Define an enum for data types for UI rendering.
const DataType = {
  AIRTABLE_LIST: 'AIRTABLE_LIST',
  AIRTABLE_COMMENTS: 'AIRTABLE_COMMENTS',
};

// List records
context.setActionHandler('list_records', async ({ tableIdOrName }) => {
  try {
    const records = await listRecords(tableIdOrName);
    context.data = { type: DataType.AIRTABLE_LIST, records };
  } catch (error) {
    context.data = {
      type: DataType.AIRTABLE_LIST,
      records: [],
      error: error.message,
    };
  }
});

// Get a record by ID
context.setActionHandler('get_record', async ({ recordId, tableIdOrName }) => {
  try {
    const record = await getRecord(recordId, tableIdOrName);
    context.data = { type: DataType.AIRTABLE_LIST, records: [record] };
  } catch (error) {
    context.data = {
      type: DataType.AIRTABLE_LIST,
      records: [],
      error: error.message,
    };
  }
});

// Create a new record
context.setActionHandler('create_record', async ({ fields, tableIdOrName }) => {
  try {
    const record = await createRecord(fields, tableIdOrName);
    context.data = {
      type: DataType.AIRTABLE_LIST,
      records: [record],
      message: `Record created successfully: ${record.id}`,
    };
  } catch (error) {
    context.data = {
      type: DataType.AIRTABLE_LIST,
      records: [],
      error: error.message,
    };
  }
});

// Update an existing record
context.setActionHandler(
  'update_record',
  async ({ recordId, fields, tableIdOrName }) => {
    try {
      const record = await updateRecord(recordId, fields, tableIdOrName);
      context.data = {
        type: DataType.AIRTABLE_LIST,
        records: [record],
        message: `Updated successfully: ${record.id}`,
      };
    } catch (error) {
      context.data = {
        type: DataType.AIRTABLE_LIST,
        records: [],
        error: error.message,
      };
    }
  }
);

// Delete a record
context.setActionHandler(
  'delete_record',
  async ({ recordId, tableIdOrName }) => {
    try {
      const result = await deleteRecord(recordId, tableIdOrName);
      if (result.deleted) {
        context.data = {
          type: DataType.AIRTABLE_LIST,
          records: [],
          message: `Record deleted successfully: ${result.id}`,
        };
      } else {
        context.data = {
          type: DataType.AIRTABLE_LIST,
          records: [],
          error: `Failed to delete record: ${recordId}`,
        };
      }
    } catch (error) {
      context.data = {
        type: DataType.AIRTABLE_LIST,
        records: [],
        error: error.message,
      };
    }
  }
);

// List comments
context.setActionHandler(
  'list_comments',
  async ({ recordId, tableIdOrName, pageSize, offset }) => {
    try {
      const result = await listComments(
        recordId,
        tableIdOrName,
        pageSize,
        offset
      );
      context.data = {
        type: DataType.AIRTABLE_COMMENTS,
        comments: result.comments,
        offset: result.offset,
      };
    } catch (error) {
      context.data = {
        type: DataType.AIRTABLE_COMMENTS,
        comments: [],
        error: error.message,
      };
    }
  }
);

// Create a comment
context.setActionHandler(
  'create_comment',
  async ({ recordId, tableIdOrName, text, parentCommentId }) => {
    try {
      const comment = await createComment(
        recordId,
        tableIdOrName,
        text,
        parentCommentId
      );
      context.data = {
        type: DataType.AIRTABLE_COMMENTS,
        comments: [comment],
        message: `Comment created successfully: ${comment.id}`,
      };
    } catch (error) {
      context.data = {
        type: DataType.AIRTABLE_COMMENTS,
        comments: [],
        error: error.message,
      };
    }
  }
);

// Update a comment
context.setActionHandler(
  'update_comment',
  async ({ recordId, tableIdOrName, rowCommentId, text }) => {
    try {
      const updatedComment = await updateComment(
        recordId,
        tableIdOrName,
        rowCommentId,
        text
      );
      context.data = {
        type: DataType.AIRTABLE_COMMENTS,
        comments: [updatedComment],
        message: `Comment updated successfully: ${updatedComment.id}`,
      };
    } catch (error) {
      context.data = {
        type: DataType.AIRTABLE_COMMENTS,
        comments: [],
        error: error.message,
      };
    }
  }
);

// Delete a comment
context.setActionHandler(
  'delete_comment',
  async ({ recordId, tableIdOrName, rowCommentId }) => {
    try {
      const result = await deleteComment(recordId, tableIdOrName, rowCommentId);
      if (result.deleted) {
        context.data = {
          type: DataType.AIRTABLE_COMMENTS,
          comments: [],
          message: `Comment deleted successfully: ${result.id}`,
        };
      } else {
        context.data = {
          type: DataType.AIRTABLE_COMMENTS,
          comments: [],
          error: `Failed to delete comment: ${rowCommentId}`,
        };
      }
    } catch (error) {
      context.data = {
        type: DataType.AIRTABLE_COMMENTS,
        comments: [],
        error: error.message,
      };
    }
  }
);

context.onconnect = () => {
  context.data = { type: DataType.AIRTABLE_LIST, records: [] };
};

context.ondata = () => {
  if (!context.data) return;

  if (context.data.type === DataType.AIRTABLE_LIST) {
    if (context.data.error) {
      document.body.innerHTML = `<div class="error">Error: ${context.data.error}</div>`;
    } else {
      const messageHTML = context.data.message
        ? `<div class="message">${context.data.message}</div>`
        : '';
      document.body.innerHTML = /*html*/ `
        <div class="airtable-list">
          ${messageHTML}
          ${context.data.records
            .map(
              (record) => `
            <div class="record-item">
              <h2>${
                record.fields.Name || record.fields.name || 'Unnamed Record'
              }</h2>
              <p>Record ID: ${record.id}</p>
              <pre>${JSON.stringify(record, null, 2)}</pre>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }
  } else if (context.data.type === DataType.AIRTABLE_COMMENTS) {
    if (context.data.error) {
      document.body.innerHTML = `<div class="error">Error: ${context.data.error}</div>`;
    } else {
      const commentsHTML = context.data.comments
        .map(
          (comment) => `
        <div class="comment-item">
          <p><strong>ID:</strong> ${comment.id}</p>
          <p><strong>Created:</strong> ${comment.createdTime}</p>
          <p><strong>Updated:</strong> ${comment.lastUpdatedTime || 'Never'}</p>
          <p><strong>Text:</strong> ${comment.text}</p>
          ${
            comment.parentCommentId
              ? `<p><strong>Replying to:</strong> ${comment.parentCommentId}</p>`
              : ''
          }
        </div>
      `
        )
        .join('');
      document.body.innerHTML = /*html*/ `
        <div class="airtable-comments">
          <h2>Comments</h2>
          ${commentsHTML}
          ${
            context.data.offset
              ? `<p>Next offset: ${context.data.offset}</p>`
              : ''
          }
          ${
            context.data.message
              ? `<div class="message">${context.data.message}</div>`
              : ''
          }
        </div>
      `;
    }
  }
};
