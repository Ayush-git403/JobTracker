const { S3Client } = require('@aws-sdk/client-s3');

// In production this reads from ECS task role / Secrets Manager instead of
// raw env vars — for now, local dev uses AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
// from server/.env, same place your other secrets already live.
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  requestChecksumCalculation: 'WHEN_REQUIRED',
});

const RESUME_BUCKET = process.env.AWS_S3_RESUME_BUCKET;

module.exports = { s3Client, RESUME_BUCKET };