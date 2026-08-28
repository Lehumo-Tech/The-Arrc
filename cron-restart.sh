#!/bin/bash
# Backup auto-restart: checks if the dev server is up, restarts if not.
# Run via cron every ~2 minutes as a safety net behind the watchdog.
cd /home/z/my-project
if ! pgrep -f "next-server" > /dev/null 2>&1; then
  pkill -9 -f "next dev" 2>/dev/null
  sleep 1
  NODE_OPTIONS="--max-old-space-size=1536" /home/z/my-project/node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
  disown
  echo "[$(date)] Cron restart: server (re)started" >> /home/z/my-project/watchdog.log
fi
# Also ensure watchdog is running
if ! pgrep -f "watchdog.sh" > /dev/null 2>&1; then
  nohup setsid bash /home/z/my-project/watchdog.sh </dev/null >/dev/null 2>&1 &
  disown
  echo "[$(date)] Cron restart: watchdog (re)started" >> /home/z/my-project/watchdog.log
fi
