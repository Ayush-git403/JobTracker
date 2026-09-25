const { SQSClient } = require('@aws-sdk/client-sqs');

const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

const RESUME_SCORING_QUEUE_URL = process.env.AWS_SQS_RESUME_SCORING_QUEUE_URL;

module.exports = { sqsClient, RESUME_SCORING_QUEUE_URL };