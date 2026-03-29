package model

type Level struct {
	ID                int      `json:"id"`
	Name              string   `json:"name"`
	Tier              int      `json:"tier"`
	ScrollSpeed       float64  `json:"scrollSpeed"`
	SpeedIncrement    float64  `json:"speedIncrement"`
	TimingWindowMs    int      `json:"timingWindowMs"`
	WordCount         int      `json:"wordCount"`
	AllowedRows       []string `json:"allowedRows"`
	RequireShift      bool     `json:"requireShift"`
	SpeedWords        bool     `json:"speedWords"`
	UnlockRequirement int      `json:"unlockRequirement"`
	StarThresholds    [3]int   `json:"starThresholds"`
}
