export const ex7data = `
{
"StructuralAnalysisModel": {
	"BIM": "unknown",
	"description": "",
	"engineer": "",
	"units": {
		"force": "kip",
		"length": "in",
		"time": "sec",
		"temperature": "F"
	},
	"properties": {
		"uniaxialMaterials": [

		],
		"ndMaterials": [

		],
		"sections": [
			{"name": "1", "type": "ElasticMembranePlateSection", "Em": 3000, "Ep": 3000, "nu": 0.25, "thickness": 1.175, "masspervolume": 1.27}
		],
		"crdTransformations": [

		]
	},
	"geometry": {
		"nodes": [
			{"name": 1, "ndf": 6, "crd": [-20, 0, 0]},
			{"name": 2, "ndf": 6, "crd": [-15.625, 4.375, 5]},
			{"name": 3, "ndf": 6, "crd": [-12.5, 7.5, 10]},
			{"name": 4, "ndf": 6, "crd": [-10.625, 9.375, 15]},
			{"name": 5, "ndf": 6, "crd": [-10, 10, 20]},
			{"name": 6, "ndf": 6, "crd": [-10.625, 9.375, 25]},
			{"name": 7, "ndf": 6, "crd": [-12.5, 7.5, 30]},
			{"name": 8, "ndf": 6, "crd": [-15.625, 4.375, 35]},
			{"name": 9, "ndf": 6, "crd": [-20, 0, 40]},
			{"name": 10, "ndf": 6, "crd": [0, 0, 0]},
			{"name": 11, "ndf": 6, "crd": [0, 4.375, 5]},
			{"name": 12, "ndf": 6, "crd": [0, 7.5, 10]},
			{"name": 13, "ndf": 6, "crd": [0, 9.375, 15]},
			{"name": 14, "ndf": 6, "crd": [0, 10, 20]},
			{"name": 15, "ndf": 6, "crd": [0, 9.375, 25]},
			{"name": 16, "ndf": 6, "crd": [0, 7.5, 30]},
			{"name": 17, "ndf": 6, "crd": [0, 4.375, 35]},
			{"name": 18, "ndf": 6, "crd": [0, 0, 40]},
			{"name": 19, "ndf": 6, "crd": [20, 0, 0]},
			{"name": 20, "ndf": 6, "crd": [15.625, 4.375, 5]},
			{"name": 21, "ndf": 6, "crd": [12.5, 7.5, 10]},
			{"name": 22, "ndf": 6, "crd": [10.625, 9.375, 15]},
			{"name": 23, "ndf": 6, "crd": [10, 10, 20]},
			{"name": 24, "ndf": 6, "crd": [10.625, 9.375, 25]},
			{"name": 25, "ndf": 6, "crd": [12.5, 7.5, 30]},
			{"name": 26, "ndf": 6, "crd": [15.625, 4.375, 35]},
			{"name": 27, "ndf": 6, "crd": [20, 0, 40]}
		],
		"elements": [
			{"name": 1, "type": "ShellMITC4", "nodes": [1, 2, 11, 10], "section": "1"},
			{"name": 2, "type": "ShellMITC4", "nodes": [2, 3, 12, 11], "section": "1"},
			{"name": 3, "type": "ShellMITC4", "nodes": [3, 4, 13, 12], "section": "1"},
			{"name": 4, "type": "ShellMITC4", "nodes": [4, 5, 14, 13], "section": "1"},
			{"name": 5, "type": "ShellMITC4", "nodes": [5, 6, 15, 14], "section": "1"},
			{"name": 6, "type": "ShellMITC4", "nodes": [6, 7, 16, 15], "section": "1"},
			{"name": 7, "type": "ShellMITC4", "nodes": [7, 8, 17, 16], "section": "1"},
			{"name": 8, "type": "ShellMITC4", "nodes": [8, 9, 18, 17], "section": "1"},
			{"name": 9, "type": "ShellMITC4", "nodes": [10, 11, 20, 19], "section": "1"},
			{"name": 10, "type": "ShellMITC4", "nodes": [11, 12, 21, 20], "section": "1"},
			{"name": 11, "type": "ShellMITC4", "nodes": [12, 13, 22, 21], "section": "1"},
			{"name": 12, "type": "ShellMITC4", "nodes": [13, 14, 23, 22], "section": "1"},
			{"name": 13, "type": "ShellMITC4", "nodes": [14, 15, 24, 23], "section": "1"},
			{"name": 14, "type": "ShellMITC4", "nodes": [15, 16, 25, 24], "section": "1"},
			{"name": 15, "type": "ShellMITC4", "nodes": [16, 17, 26, 25], "section": "1"},
			{"name": 16, "type": "ShellMITC4", "nodes": [17, 18, 27, 26], "section": "1"}
		]
	}
}
}

`
