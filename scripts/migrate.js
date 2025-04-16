const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Function to run a shell command and log output
function runCommand(command) {
  console.log(`> ${command}`);
  try {
    const output = execSync(command, { encoding: "utf8" });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    console.error(error.stdout);
    console.error(error.stderr);
    process.exit(1);
  }
}

// Main function to run the migration
async function main() {
  console.log("🔄 Starting database migration process...");

  // Check if prisma directory exists
  if (!fs.existsSync(path.join(process.cwd(), "prisma"))) {
    console.error("Error: prisma directory not found");
    process.exit(1);
  }

  // Check if schema.prisma exists
  if (!fs.existsSync(path.join(process.cwd(), "prisma", "schema.prisma"))) {
    console.error("Error: schema.prisma not found");
    process.exit(1);
  }

  // Create migrations directory if it doesn't exist
  const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log("Created migrations directory");
  }

  // Generate migration
  console.log("📝 Generating migration...");
  const migrationName = "apply_schema_changes";
  runCommand(`npx prisma migrate dev --name ${migrationName} --create-only`);

  // Apply migration
  console.log("🚀 Applying migration...");
  runCommand("npx prisma migrate deploy");

  // Generate Prisma client
  console.log("🔧 Generating Prisma client...");
  runCommand("npx prisma generate");

  console.log("✅ Migration completed successfully!");
}

main().catch((e) => {
  console.error("❌ Migration failed:");
  console.error(e);
  process.exit(1);
});
