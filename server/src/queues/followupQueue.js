const { Queue } = require('bullmq');
const { redisConfig } = require('../config/redis');

const QUEUE_NAME = 'followup-reminders';

let followupQueue = null;

try {
  followupQueue = new Queue(QUEUE_NAME, {
    connection: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 200,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  });

  followupQueue.on('error', (err) => {
    console.warn(`[BullMQ Queue] Follow-up queue warning: ${err.message}`);
  });
} catch (err) {
  console.warn(`[BullMQ Queue] Failed to initialize queue: ${err.message}`);
}

/**
 * Schedule a delayed follow-up reminder job
 */
async function scheduleFollowupReminder(data) {
  const { activityId, leadId, agentId, nextFollowUpAt, notes } = data;

  if (!nextFollowUpAt || !followupQueue) {
    return null;
  }

  const targetTime = new Date(nextFollowUpAt).getTime();
  const now = Date.now();
  const delay = Math.max(0, targetTime - now);

  const jobName = `reminder:${activityId}`;
  const jobData = {
    activityId: activityId.toString(),
    leadId: leadId ? leadId.toString() : null,
    agentId: agentId ? agentId.toString() : null,
    nextFollowUpAt: new Date(nextFollowUpAt).toISOString(),
    notes
  };

  try {
    const job = await followupQueue.add(jobName, jobData, {
      delay,
      jobId: `job_${activityId}`
    });
    console.log(`[BullMQ Queue] Scheduled follow-up reminder for activity ${activityId} in ${Math.round(delay / 1000)}s`);
    return job;
  } catch (err) {
    console.warn(`[BullMQ Queue] Failed to add reminder job: ${err.message}`);
    return null;
  }
}

module.exports = {
  followupQueue,
  scheduleFollowupReminder
};
