const pool = require("../src/database/client");

async function testDatabaseConnection() {
    try {
const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
`);

console.log("Database connection successful.");
console.log("Tables:");

for (const row of result.rows) {
    console.log(`- ${row.table_name}`);
}
    } catch (error) {
        console.error("Database connection failed.");
        console.error(error.message);

        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

testDatabaseConnection();