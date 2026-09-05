# Latin Squares dMAT Practice Tool

This repository contains a web-based practice tool for the Latin Squares subtest of the digital Master Assessment Test (dMAT) Core Module. Since official practice data is scarce, this tool generates nearly infinite random grids to help you train.

## How Latin Squares Work in the dMAT

* The puzzle is played on a 5x5 grid.
* Some fields in the grid are pre-filled with letters.
* Each letter can appear only once in each row and each column.
* Only the letters shown in the response options are allowed in the grid.
* The goal is to deduce the correct letter for the single field marked with a question mark.
* You will often need to mentally solve other empty fields first before you can figure out the target square.

## Simulation Parameters & Difficulty

Because exact exam generation algorithms aren't public, this tool uses specific constraints to mimic the cognitive load of the actual test:

* **Visible Clues:** Every generated grid leaves between 9 and 15 boxes pre-filled to ensure a solvable but challenging board state.
* **Difficulty Scaling:** The difficulty isn't just about how many empty squares there are. It is scaled based on "deduction depth"—the number of logical steps required to isolate the answer for the target square.
  * **Easy:** 1-2 logical steps (direct elimination).
  * **Medium:** 2-3 logical steps.
  * **Hard:** 3-5+ logical steps.
  * **Random:** Generates a board of any difficulty with a randomized clue count.
