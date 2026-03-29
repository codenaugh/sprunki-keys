package store

import (
	"encoding/json"
	"fmt"

	"sprunki-backend/internal/model"
)

type LevelStore interface {
	GetAll() []model.Level
	GetByID(id int) (model.Level, error)
}

type InMemoryLevelStore struct {
	levels []model.Level
	byID   map[int]model.Level
}

func NewLevelStore(raw []byte) (*InMemoryLevelStore, error) {
	var levels []model.Level
	if err := json.Unmarshal(raw, &levels); err != nil {
		return nil, fmt.Errorf("parse levels: %w", err)
	}
	byID := make(map[int]model.Level, len(levels))
	for _, l := range levels {
		byID[l.ID] = l
	}
	return &InMemoryLevelStore{levels: levels, byID: byID}, nil
}

func (s *InMemoryLevelStore) GetAll() []model.Level {
	return s.levels
}

func (s *InMemoryLevelStore) GetByID(id int) (model.Level, error) {
	l, ok := s.byID[id]
	if !ok {
		return model.Level{}, fmt.Errorf("level %d not found", id)
	}
	return l, nil
}
