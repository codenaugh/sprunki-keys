package data

import _ "embed"

//go:embed levels.json
var LevelsJSON []byte

//go:embed words.json
var WordsJSON []byte
