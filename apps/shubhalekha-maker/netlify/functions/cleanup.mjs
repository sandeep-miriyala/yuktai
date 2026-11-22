// రోజుకు ఒకసారి (UTC 20:30 = IST ఉదయం 2:00): గుర్తు సందేశాలు, తొలగింపులు
import { getHandlers } from "../../lib/deps.mjs";
export default async () => {
  const r = await getHandlers().cleanup();
  console.log(`cleanup: reminded ${r.reminded}, deleted ${r.deleted}`);
};
export const config = { schedule: "30 20 * * *" };
