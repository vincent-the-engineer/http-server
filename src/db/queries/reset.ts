import { sql } from "drizzle-orm";

import { db } from "../index.js";


export async function resetDatabase() {
  await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE;`);
}

