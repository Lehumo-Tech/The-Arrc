#!/bin/bash
# Bulletproof watchdog: keeps the Next.js dev server alive.
# Ignores SIGHUP/SIGTERM so it survives parent shell exit and OOM collateral.
trap '' HUP TERM
cd /home/z/my-project
exec >> /home/z/my-project/watchdog.log 2>&1
echo "[$(date)] Watchdog started (pid $$)"
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    pkill -9 -f "next dev" 2>/dev/null
    sleep 2
    NODE_OPTIONS="--max-old-space-size=1536" /home/z/my-project/node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 &
    disown $!
    echo "[$(date)] Server (re)started, PID $!"
    sleep 6
  fi
  sleep 2
done
