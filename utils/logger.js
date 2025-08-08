const fs = require('fs');
const path = require('path');
const moment = require('moment');
require('dotenv').config();

const LOG_FILE_PATH = process.env.LOG_FILE_PATH || 'ddos_access.log';

// Convert log entry to Apache Common Log Format
const toCommonLogFormat = (log) => {
  const timestamp = moment(log.timestamp).format('DD/MMM/YYYY:HH:mm:ss ZZ');
  return `${log.ip} - - [${timestamp}] "${log.method} ${log.url} HTTP/1.1" 200 ${log.payloadSize}`;
};

// Log handler
const log = (requestLog) => {
  // Console log
  console.log(JSON.stringify(requestLog, null, 2));

  // File log in Apache format
  const commonLogLine = toCommonLogFormat(requestLog);
  fs.appendFileSync(
    path.join(__dirname, '..', LOG_FILE_PATH),
    commonLogLine + '\n'
  );
};

module.exports = {
  log
};
