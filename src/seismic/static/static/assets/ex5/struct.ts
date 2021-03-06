export const ex5data = `
{
"StructuralAnalysisModel": {
	"BIM": "unknown",
	"description": "",
	"engineer": "",
	"units": {
		"force": "",
		"length": "",
		"time": "",
		"temperature": ""
	},
	"properties": {
		"uniaxialMaterials": [
			{"name": "1", "type": "HardeningMaterial", "E": 29000, "fy": 36, "Hiso": 0, "Hkin": 1526.32, "eta": 0}
		],
		"ndMaterials": [

		],
		"sections": [

		],
		"crdTransformations": [

		]
	},
	"geometry": {
		"nodes": [
			{"name": 1, "ndf": 2, "crd": [0, 0]},
			{"name": 2, "ndf": 2, "crd": [72, 0]},
			{"name": 3, "ndf": 2, "crd": [168, 0]},
			{"name": 4, "ndf": 2, "crd": [48, 144]}
		],
		"elements": [
			{"name": 1, "type": "Truss", "nodes": [1, 4], "A": 4, "massperlength": 0, "material": "1"},
			{"name": 2, "type": "Truss", "nodes": [2, 4], "A": 4, "massperlength": 0, "material": "1"},
			{"name": 3, "type": "Truss", "nodes": [3, 4], "A": 4, "massperlength": 0, "material": "1"}
		]
	}
}
}

`
