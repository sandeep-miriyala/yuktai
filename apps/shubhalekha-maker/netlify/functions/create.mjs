import { getHandlers } from "../../lib/deps.mjs";
export default (req) => getHandlers().create(req);
export const config = { path: "/api/create" };
