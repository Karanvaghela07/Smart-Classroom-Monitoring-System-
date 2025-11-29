const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const CSV_DIR = process.env.CSV_DIR || path.join(__dirname, '..', 'csv');
ensureDir(CSV_DIR);

async function appendStudentCsv(row) {
  const file = path.join(CSV_DIR, 'students.csv');
  const writer = createCsvWriter({
    path: file,
    header: [
      {id:'StudentID', title:'StudentID'},
      {id:'Name', title:'Name'},
      {id:'Class', title:'Class'},
      {id:'Email', title:'Email'},
      {id:'Phone', title:'Phone'},
      {id:'JoinDate', title:'JoinDate'}
    ],
    append: fs.existsSync(file)
  });
  await writer.writeRecords([row]);
}

async function appendAttendanceCsv(row) {
  const file = path.join(CSV_DIR, 'attendance.csv');
  const writer = createCsvWriter({
    path: file,
    header: [
      {id:'StudentID', title:'StudentID'},
      {id:'Name', title:'Name'},
      {id:'Date', title:'Date'},
      {id:'Time', title:'Time'},
      {id:'MarkedBy', title:'MarkedBy'}
    ],
    append: fs.existsSync(file)
  });
  await writer.writeRecords([row]);
}

module.exports = { appendStudentCsv, appendAttendanceCsv, CSV_DIR };
