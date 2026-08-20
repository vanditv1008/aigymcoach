import subprocess
import sys
import os
import time

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")

def get_python_executable():
    try:
        res = subprocess.run([sys.executable, "-c", "import uvicorn"], capture_output=True)
        if res.returncode == 0:
            return sys.executable
    except Exception:
        pass

    try:
        res = subprocess.run(["python", "-c", "import uvicorn"], capture_output=True)
        if res.returncode == 0:
            return "python"
    except Exception:
        pass

    return sys.executable

def main():
    python_cmd = get_python_executable()

    backend = subprocess.Popen(
        [python_cmd, "-m", "uvicorn", "backend.main:app", "--port", "8000"],
        cwd=ROOT_DIR,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND_DIR,
        shell=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    time.sleep(1)

    print("\nAI Real-Time Gym Coach is running at:")
    print("http://localhost:5173\n")

    processes = [backend, frontend]

    try:
        while True:
            for proc in processes:
                if proc.poll() is not None:
                    raise KeyboardInterrupt
            time.sleep(1)
    except KeyboardInterrupt:
        for proc in processes:
            if proc.poll() is None:
                proc.terminate()

if __name__ == "__main__":
    main()
