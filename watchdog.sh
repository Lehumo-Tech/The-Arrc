#!/bin/bash
# Bulletproof watchdog using double-fork daemon pattern.
# The double-fork ( process & ) reparents the child to PID 1 (tini),
# which prevents the sandbox from reaping it when tool calls exit.
# Ignores SIGHUP/SIGTERM so it survives parent shell exit.
trap '' HUP TERM
cd /home/z/my-project
exec >> /home/z/my-project/watchdog.log 2>&1
echo "[$(date)] Watchdog started (pid $$)"
while true; do
  if ! pgrep -f "next-server" > /dev/null 2>&1; then
    pkill -9 -f "next dev" 2>/dev/null
    sleep 2
    # Double-fork: the subshell exits immediately, reparenting next to PID 1
    ( NODE_OPTIONS="--max-old-space-size=1024" /home/z/my-project/node_modules/.bin/next dev -p 3000 >> /home/z/my-project/dev.log 2>&1 & )
    echo "[$(date)] Server (re)started via double-fork"
    sleep 6
  fi
  sleep 3
done
