import { db } from "./db";
import { encouragementVerses } from "@shared/schema";
import { DEFAULT_VERSES } from "../client/src/lib/constants";

async function seed() {
  console.log("Seeding database with initial encouragement verses...");

  for (const verse of DEFAULT_VERSES) {
    await db.insert(encouragementVerses).values({
      verse: verse.verse,
      reference: verse.reference,
      isActive: true,
    });
  }

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
