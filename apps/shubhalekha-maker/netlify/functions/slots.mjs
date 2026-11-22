import { getHandlers } from "../../lib/deps.mjs";
export default (req) => getHandlers().slots(req);
export const config = { path: "/api/slots" };
