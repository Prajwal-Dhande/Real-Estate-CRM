const { Worker } = require('bullmq');
const { redisConfig } = require('../config/redis');
const Activity = require('../models/Activity');
const Lead = require('../models/Lead');
const User = require('../models/User');
const { emitFollowupDue } = require('../socket');

const QUEUE_NAME = 'followup-reminders';

let followupWorker = null;

function initFollowupWorker() {
  try {
    followupWorker = new Worker(
      QUEUE_NAME,
      async (job) => {
        console.log(`[BullMQ Worker] Processing follow-up job: ${job.id}`);
        const { activityId } = job.data;

        const activity = await Activity.findById(activityId);
        if (!activity) {
          console.log(`[BullMQ Worker] Activity ${activityId} not found, skipping.`);
          return { skipped: true, reason: 'activity_not_found' };
        }

        if (activity.isFollowUpCompleted) {
          console.log(`[BullMQ Worker] Activity ${activityId} follow-up already completed.`);
          return { skipped: true, reason: 'already_completed' };
        }

        // Fetch lead and agent details
        const lead = await Lead.findById(activity.lead);
        const agent = await User.findById(activity.agent);

        const reminderPayload = {
          activityId: activity._id,
          leadId: lead ? lead._id : activity.lead,
          leadName: lead ? lead.fullName : 'Unknown Lead',
          leadPhone: lead ? lead.phone : '',
          agentId: agent ? agent._id : activity.agent,
          agentName: agent ? agent.name : 'Assigned Agent',
          notes: activity.notes,
          activityType: activity.activityType,
          dueAt: activity.nextFollowUpAt
        };

        // Emit real-time Socket.io notification
        emitFollowupDue(reminderPayload);

        // Simulation of Email Alert trigger (as specified in ARCHITECTURE.md §4)
        console.log(`[BullMQ Worker] 🔔 FOLLOW-UP DUE: Lead "${reminderPayload.leadName}" (${reminderPayload.leadPhone}) | Agent: "${reminderPayload.agentName}" | Notes: "${reminderPayload.notes}"`);

        return { success: true, reminder: reminderPayload };
      },
      {
        connection: redisConfig,
        concurrency: 5
      }
    );

    followupWorker.on('completed', (job, returnvalue) => {
      console.log(`[BullMQ Worker] Job ${job.id} completed successfully.`);
    });

    followupWorker.on('failed', (job, err) => {
      console.error(`[BullMQ Worker] Job ${job ? job.id : 'unknown'} failed: ${err.message}`);
    });

    followupWorker.on('error', (err) => {
      console.warn(`[BullMQ Worker] Warning: ${err.message}`);
    });

    console.log(`[BullMQ Worker] Initialized worker for queue "${QUEUE_NAME}"`);
    return followupWorker;
  } catch (err) {
    console.warn(`[BullMQ Worker] Could not start worker: ${err.message}`);
    return null;
  }
}

module.exports = {
  initFollowupWorker,
  getFollowupWorker: () => followupWorker
};
