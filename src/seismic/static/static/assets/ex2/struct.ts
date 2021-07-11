export const ex2data = `
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
			{"name": "1", "type": "Concrete01", "Ec": 3000, "fc": -6, "epsc": -0.004, "fcu": -5, "epscu": -0.014},
			{"name": "2", "type": "Concrete01", "Ec": 5000, "fc": -5, "epsc": -0.002, "fcu": -0, "epscu": -0.006},
			{"name": "3", "type": "Steel01", "E": 30000, "fy": 60, "b": 0.01, "a1": 0, "a2": 55, "a3": 0, "a4": 55}
		],
		"ndMaterials": [

		],
		"sections": [
			{"name": "1", "type": "FiberSection2d", "fibers": [
				{"coord": [-9.45, 0.0], "area": 25.2, "material": "1"},
				{"coord": [-7.35, 0.0], "area": 25.2, "material": "1"},
				{"coord": [-5.25, 0.0], "area": 25.2, "material": "1"},
				{"coord": [-3.15, 0.0], "area": 25.2, "material": "1"},
				{"coord": [-1.05, 0.0], "area": 25.2, "material": "1"},
				{"coord": [1.05, 0.0], "area": 25.2, "material": "1"},
				{"coord": [3.15, 0.0], "area": 25.2, "material": "1"},
				{"coord": [5.25, 0.0], "area": 25.2, "material": "1"},
				{"coord": [7.35, 0.0], "area": 25.2, "material": "1"},
				{"coord": [9.45, 0.0], "area": 25.2, "material": "1"},
				{"coord": [-10.8, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-8.4, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-3.6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-1.2, 0.0], "area": 3.6, "material": "2"},
				{"coord": [1.2, 0.0], "area": 3.6, "material": "2"},
				{"coord": [3.6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [8.4, 0.0], "area": 3.6, "material": "2"},
				{"coord": [10.8, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-10.8, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-8.4, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-3.6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-1.2, 0.0], "area": 3.6, "material": "2"},
				{"coord": [1.2, 0.0], "area": 3.6, "material": "2"},
				{"coord": [3.6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [6, 0.0], "area": 3.6, "material": "2"},
				{"coord": [8.4, 0.0], "area": 3.6, "material": "2"},
				{"coord": [10.8, 0.0], "area": 3.6, "material": "2"},
				{"coord": [-11.625, 0.0], "area": 9, "material": "2"},
				{"coord": [-10.875, 0.0], "area": 9, "material": "2"},
				{"coord": [10.875, 0.0], "area": 9, "material": "2"},
				{"coord": [11.625, 0.0], "area": 9, "material": "2"},
				{"coord": [10.5, 0.0], "area": 0.6, "material": "3"},
				{"coord": [10.5, 0.0], "area": 0.6, "material": "3"},
				{"coord": [10.5, 0.0], "area": 0.6, "material": "3"},
				{"coord": [0, 0.0], "area": 0.6, "material": "3"},
				{"coord": [0, 0.0], "area": 0.6, "material": "3"},
				{"coord": [-10.5, 0.0], "area": 0.6, "material": "3"},
				{"coord": [-10.5, 0.0], "area": 0.6, "material": "3"},
				{"coord": [-10.5, 0.0], "area": 0.6, "material": "3"}
			]}
		],
		"crdTransformations": [
			{"name": "1", "type": "PDeltaCrdTransf2d"},
			{"name": "2", "type": "LinearCrdTransf2d"}
		]
	},
	"geometry": {
		"nodes": [
			{"name": 1, "ndf": 3, "crd": [0, 0]},
			{"name": 2, "ndf": 3, "crd": [360, 0]},
			{"name": 3, "ndf": 3, "crd": [0, 144]},
			{"name": 4, "ndf": 3, "crd": [360, 144]}
		],
		"elements": [
			{"name": 1, "type": "ForceBeamColumn2d", "nodes": [1, 3], "sections": ["1", "1", "1", "1", "1"], "integration": {"type": "Lobatto"}, "massperlength": 0, "crdTransformation": "1"},
			{"name": 2, "type": "ForceBeamColumn2d", "nodes": [2, 4], "sections": ["1", "1", "1", "1", "1"], "integration": {"type": "Lobatto"}, "massperlength": 0, "crdTransformation": "1"},
			{"name": 3, "type": "ElasticBeam2d", "nodes": [3, 4], "E": 4030, "A": 360, "Iz": 8640, "massperlength": 0, "release": 0, "crdTransformation": "2"}
		]
	}
}
}

`
