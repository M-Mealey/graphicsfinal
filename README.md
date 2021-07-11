# Seismic Analysis Visualizer
## CS 378H Final Project
name: Megan Mealey <br>
eid: mnm2788

How to run: 

In main folder, first run `make-seismic.py`, then run `http-server dist -c-1` and view the model at 127.0.0.1:8080

To re-generate the example data, run the python program stored in an example folder found in `src/seismic/static/static/assets`

The controls for the WebGL window are the same as the skinning project with a few additions:
* Keys 1-9: Load the corresponding model
* Space: (During playback) toggle between play and pause
* T: toggle shadows
* -/+: (while paused) jump one frame forward/back
* Click on highlighted object: select object, info displayed in overlay
* Right click: clear selected object


## Description of examples
Gifs are embedded, there are also videos in the artifacts folder

**Example 1:**
https://github.com/OpenSees/OpenSees/blob/master/EXAMPLES/ExamplePython/Example4.1.py <br>
2D frame pushover analysis - a force is applied to the right side of the frame and increases until the target displacement is reached. <br>
![Alt](/artifacts/ex1_gif.gif "example 1")


**Example 2:** https://github.com/OpenSees/OpenSees/blob/master/EXAMPLES/ExamplePython/Example3.3.py <br>
A simple frame in a simulated earthquake<br>
![Alt](/artifacts/ex2_gif.gif "example 2")

**Example 3:** https://github.com/OpenSees/OpenSees/blob/master/EXAMPLES/ExamplePython/Example5.1.py <br>
A three-story frame in a simulated earthquake<br>
![Alt](/artifacts/ex3_gif.gif "example 3")

**Example 4:** https://openseespydoc.readthedocs.io/en/latest/src/ThreeStorySteel.html <br>
3-tier frame pushover analysis - a force is applied to the right side of the frame and increases until the target displacement is reached.<br>
![Alt](/artifacts/ex4_gif.gif "example 4")

**Example 5:** https://openseespydoc.readthedocs.io/en/latest/src/nonlinearTruss.html <br>
Nonlinear pushover analysis - the force on the top node increases linearly with time, and the displacement increases nonlinearly<br>
![Alt](/artifacts/ex5_gif.gif "example 5")

**Example 6:** https://openseespydoc.readthedocs.io/en/latest/src/RCshearwall.html <br>
Cyclic (back and forth) force is applied to the base of the wall<br>
![Alt](/artifacts/ex6_gif.gif "example 6")

**Example 7:** https://github.com/OpenSees/OpenSees/blob/master/EXAMPLES/ExamplePython/Example7.1.py <br>
Vibrational force being applied to a 3D shell structure<br>
![Alt](/artifacts/ex7_gif.gif "example 7")

**Examples 8 and 9:** https://github.com/OpenSees/OpenSees/blob/master/EXAMPLES/ExamplePython/Example8.1.py <br>
A large force is applied to a cantilever beam, and the beam vibrates as it returns to equilibrium<br>
![Alt](/artifacts/ex8_gif.gif "example 8")
![Alt](/artifacts/ex9_gif.gif "example 9")

