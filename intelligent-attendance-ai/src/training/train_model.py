import os
import sys

# Import và thực thi từ train_model gốc
current_dir = os.path.dirname(os.path.abspath(__file__))
ai_root = os.path.abspath(os.path.join(current_dir, "..", ".."))
if ai_root not in sys.path:
    sys.path.insert(0, ai_root)

from train_model import main

if __name__ == "__main__":
    main()
