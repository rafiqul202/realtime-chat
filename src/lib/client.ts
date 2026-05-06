import { app } from "@/app/api/[[...slugs]]/route";
import { treaty } from "@elysia/eden";

// .api to enter /api prefix
export const client =
  // process is defined on server side and build time
  treaty<typeof app>("localhost:3000").api;
