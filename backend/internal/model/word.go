package model

type Word struct {
	Text   string   `json:"text"`
	Tier   int      `json:"tier"`
	Rows   []string `json:"rows"`
	Length int      `json:"length"`
}
