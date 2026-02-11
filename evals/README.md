# FinBuddy AI Evaluation Framework

This directory contains the tools needed to measure and maintain the accuracy of our AI extraction pipeline.

## Structure
- `/data/ground_truth.json`: The "Golden Source" file containing expected outputs for specific test images.
- `/scripts/run_eval.js`: The main execution script.

## How to Run
1. Ensure your `.env` file has `OPENAI_API_KEY`.
2. Run:
   ```bash
   node evals/scripts/run_eval.js
   ```

## Metrics Tracked
- **Amount Accuracy**: Exact match or % deviation.
- **Category Precision**: Accuracy of classification.
- **Item Recall**: Does the AI detect all items listed in the ground truth?
