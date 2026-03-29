package store

import (
	"encoding/json"
	"fmt"
	"math/rand"

	"sprunki-backend/internal/model"
)

type WordStore interface {
	GetByTier(tier int) []model.Word
	GetRandom(tier int, count int) []model.Word
}

type InMemoryWordStore struct {
	byTier map[int][]model.Word
}

func NewWordStore(raw []byte) (*InMemoryWordStore, error) {
	var tiers map[string][]model.Word
	if err := json.Unmarshal(raw, &tiers); err != nil {
		return nil, fmt.Errorf("parse words: %w", err)
	}
	byTier := make(map[int][]model.Word)
	for k, v := range tiers {
		var tier int
		fmt.Sscanf(k, "%d", &tier)
		byTier[tier] = v
	}
	return &InMemoryWordStore{byTier: byTier}, nil
}

func (s *InMemoryWordStore) GetByTier(tier int) []model.Word {
	return s.byTier[tier]
}

func (s *InMemoryWordStore) GetRandom(tier int, count int) []model.Word {
	words := s.byTier[tier]
	if len(words) == 0 {
		return nil
	}
	shuffled := make([]model.Word, len(words))
	copy(shuffled, words)
	rand.Shuffle(len(shuffled), func(i, j int) {
		shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
	})
	if count > len(shuffled) {
		count = len(shuffled)
	}
	return shuffled[:count]
}
