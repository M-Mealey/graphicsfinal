from openseespy.opensees import *

import numpy as np
import matplotlib.pyplot as plt

# ------------------------------
# Start of model generation
# -----------------------------

# set modelbuilder
wipe()
model('basic', '-ndm', 2, '-ndf', 2)

# variables
A = 4.0
E = 29000.0
alpha = 0.05
sY = 36.0
udisp = 2.5
Nsteps = 1000
Px = 160.0
Py = 0.0

# create nodes
node(1, 0.0, 0.0)
node(2, 72.0, 0.0)
node(3, 168.0, 0.0)
node(4, 48.0, 144.0)

# set boundary condition
fix(1, 1, 1)
fix(2, 1, 1)
fix(3, 1, 1)

# define materials
uniaxialMaterial("Hardening", 1, E, sY, 0.0, alpha/(1-alpha)*E)

# define elements
element("Truss",1,1,4,A,1)
element("Truss",2,2,4,A,1)
element("Truss",3,3,4,A,1)

# create TimeSeries
timeSeries("Linear", 1)

# create a plain load pattern
pattern("Plain", 1, 1)

# Create the nodal load
load(4, Px, Py)

printModel("-JSON", "-file", "Example5.json")
# ------------------------------
# Start of analysis generation
# ------------------------------

# create SOE
system("ProfileSPD")

# create DOF number
numberer("Plain")

# create constraint handler
constraints("Plain")

# create integrator
integrator("LoadControl", 1.0/Nsteps)

# create algorithm
algorithm("Newton")

# create test
test('NormUnbalance',1e-8, 10)

# create analysis object
analysis("Static")

# ------------------------------
# Finally perform the analysis
# ------------------------------
recorder('Node', '-file', "Node.out", "-time", '-closeOnWrite',  '-dof',1,2,3, 'disp')
recorder('Element', '-file', "Elem.out", "-time", '-closeOnWrite', "-eleRange", 0, 30, 'forces')

# perform the analysis
data = np.zeros((Nsteps+1,2))
for j in range(Nsteps):
    analyze(1)
    data[j+1,0] = nodeDisp(4,1)
    data[j+1,1] = getLoadFactor(1)*Px


# Rewrite files as typescript files
with open("struct.ts", "w+") as f:
    with open("Example5.json","r+") as src:
      f.write("export const ex5data = `\n"+src.read()+"\n`\n")

with open("nodedata.ts", "w+") as f:
    with open("Node.out") as src:
      f.write("export const ex5node = `\n"+src.read()+"\n`\n")

with open("elemdata.ts", "w+") as f:
    with open("Elem.out","r+") as src:
      f.write("export const ex5beam = `\n"+src.read()+"\n`\n")

with open("elemdata.ts", "w+") as f:
    with open("Elem.out","r+") as src:
      data = src.read().splitlines()
      output = []
      for line in data:
        info = line.split(" ")
        new_line = []
        new_line.append(info[0])
        ind = 1
        while ind<len(info):
            new_line.append(info[ind])
            new_line.append(info[ind+1])
            new_line.append("0.0")
            ind += 2
        new_line = " ".join(new_line)
        output.append(new_line)
      output = "\n".join(output)
      f.write("export const ex5beam = `\n"+output+"\n`\n")
