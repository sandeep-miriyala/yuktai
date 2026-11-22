import { getHandlers } from "../../lib/deps.mjs";
export default (req) => getHandlers().update(req);
export const config = { path: "/api/update" };
