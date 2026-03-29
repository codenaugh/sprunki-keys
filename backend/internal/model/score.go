package model

import "time"

type Score struct {
	LevelID     int       `json:"levelId"`
	PlayerName  string    `json:"playerName"`
	Score       int       `json:"score"`
	Stars       int       `json:"stars"`
	Accuracy    float64   `json:"accuracy"`
	CompletedAt time.Time `json:"completedAt"`
}
