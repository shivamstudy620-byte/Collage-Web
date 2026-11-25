const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'college.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to open database:', err.message);
    process.exit(1);
  }
});

db.serialize(() => {
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, tables) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('Tables found:', tables.map((t) => t.name));

    let pending = tables.length;
    if (pending === 0) {
      db.close();
      return;
    }

    tables.forEach((table) => {
      db.all(`PRAGMA table_info(${table.name})`, [], (schemaErr, cols) => {
        if (schemaErr) {
          console.error(schemaErr);
          process.exit(1);
        }
        db.all(`SELECT * FROM ${table.name}`, [], (dataErr, rows) => {
          if (dataErr) {
            console.error(dataErr);
            process.exit(1);
          }
          const sanitizedRows = rows.map((row) => {
            const copy = { ...row };
            if (Object.prototype.hasOwnProperty.call(copy, 'password_hash')) {
              copy.password_hash = '[REDACTED]';
            }
            return copy;
          });
          console.log('\n=============================');
          console.log(`TABLE: ${table.name}`);
          console.log('COLUMNS:');
          console.table(cols);
          console.log(`ROWS COUNT: ${sanitizedRows.length}`);
          console.log('DATA (sensitive fields redacted):');
          console.log(JSON.stringify(sanitizedRows, null, 2));
          pending--;
          if (pending === 0) {
            db.close();
          }
        });
      });
    });
  });
});
