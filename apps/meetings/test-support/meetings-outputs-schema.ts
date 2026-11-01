import { callOutputsSchema } from "@diepen/voice/tasks/call-outputs";
import { z } from "zod";
import { dealStages } from "@/domain/deal-stage";

/**
 * The `call-outputs` schema as the meetings app returns it. Every field is the package schema's,
 * except `crm.stage`: the app normalises it to one of its own deal stages, such as "Proposal drafted".
 */
export const meetingsOutputsSchema = callOutputsSchema.extend({
  crm: callOutputsSchema.shape.crm.extend({
    stage: z.string().refine((stage) => (dealStages as readonly string[]).includes(stage), {
      message: "Not one of the app's deal stages",
    }),
  }),
});
