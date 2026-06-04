#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Vehicle Evaluation Platform..."
echo ""

# Start backend with nodemon (auto-restarts on file changes)
(cd "$SCRIPT_DIR" && npm run dev) &
BACKEND_PID=$!

# Start frontend Vite dev server
(cd "$SCRIPT_DIR/client" && npm run dev) &
FRONTEND_PID=$!

echo "Backend API  ->  http://localhost:3000"
echo "Frontend     ->  http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"

# Forward SIGINT/SIGTERM to both child processes
cleanup() {
  echo ""
  echo "Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  echo "Done."
  exit 0
}
trap cleanup INT TERM

wait "$BACKEND_PID" "$FRONTEND_PID"
