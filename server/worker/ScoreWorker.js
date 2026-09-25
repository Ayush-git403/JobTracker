// Standalone worker process — run this alongside (not instead of) your API
// server: `node worker/scoreWorker.js` in a separate terminal.
//
// At deploy time, this becomes its own ECS Fargate service, separate from
// the API service. That's the "multi-service" architecture story: the API
// handles requests, this worker handles background AI scoring, and they
// scale independently.

require('dotenv').config();
const { ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');
const { sqsClient, RESUME_SCORING_QUEUE_URL } = require('../config/sqs');
const { scoreApplication } = require('../services/scoringService');

const POLL_WAIT_SECONDS = 20; // long polling — reduces empty-response API calls vs short polling
const MAX_MESSAGES_PER_POLL = 5;

async function pollOnce() {
  const result = await sqsClient.send(new ReceiveMessageCommand({
    QueueUrl: RESUME_SCORING_QUEUE_URL,
    MaxNumberOfMessages: MAX_MESSAGES_PER_POLL,
    WaitTimeSeconds: POLL_WAIT_SECONDS,
  }));

  const messages = result.Messages || [];
  if (messages.length === 0) return; // nothing waiting, loop back to polling

  console.log(`[scoreWorker] received ${messages.length} message(s)`);

  // Process sequentially rather than in parallel — keeps this simple and
  // avoids hammering the Mistral API with concurrent requests on the free
  // tier's rate limit. Fine for this project's volume; if throughput ever
  // mattered, this is the spot to add Promise.all with a concurrency cap.
  for (const message of messages) {
    await handleMessage(message);
  }
}

async function handleMessage(message) {
  let applicationId;
  try {
    const body = JSON.parse(message.Body);
    applicationId = body.application_id;
  } catch (err) {
    console.error('[scoreWorker] malformed message body, deleting to avoid poison-pill loop:', message.Body);
    await deleteMessage(message);
    return;
  }

  try {
    console.log(`[scoreWorker] scoring application ${applicationId}...`);
    const score = await scoreApplication(applicationId);
    console.log(`[scoreWorker] done — application ${applicationId} scored ${score.fit_score}%`);
    await deleteMessage(message);
  } catch (err) {
    // Don't delete the message — scoreApplication() already wrote
    // status: 'failed' to the Score row for visibility in the UI. Leaving
    // the message means SQS will redeliver it after the visibility timeout
    // (60s) for a retry. After enough retries SQS's default redrive
    // behavior keeps retrying indefinitely — for production you'd attach a
    // dead-letter queue after N retries, which is a good next addition but
    // out of scope for now.
    console.error(`[scoreWorker] failed to score application ${applicationId}:`, err.message);
  }
}

async function deleteMessage(message) {
  await sqsClient.send(new DeleteMessageCommand({
    QueueUrl: RESUME_SCORING_QUEUE_URL,
    ReceiptHandle: message.ReceiptHandle,
  }));
}

async function run() {
  if (!RESUME_SCORING_QUEUE_URL) {
    console.error('[scoreWorker] AWS_SQS_RESUME_SCORING_QUEUE_URL is not set. Exiting.');
    process.exit(1);
  }
  console.log('[scoreWorker] started, polling for messages...');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await pollOnce();
    } catch (err) {
      console.error('[scoreWorker] poll error:', err.message);
      // brief pause before retrying so a persistent AWS-side issue doesn't
      // spin the loop as fast as possible
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

run();