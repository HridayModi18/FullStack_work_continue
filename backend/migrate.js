const sequelize = require('./config/db');

async function runMigration() {
  try {
    console.log("Adding rollNumber...");
    await sequelize.query('ALTER TABLE Users ADD COLUMN rollNumber VARCHAR(255);');
  } catch (e) {
    console.log("rollNumber might already exist:", e.message);
  }
  
  try {
    console.log("Adding year...");
    await sequelize.query('ALTER TABLE Users ADD COLUMN year VARCHAR(255);');
  } catch (e) {
    console.log("year might already exist:", e.message);
  }

  console.log("Migration finished.");
  process.exit(0);
}

runMigration();
