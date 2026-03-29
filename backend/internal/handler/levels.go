package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"sprunki-backend/internal/store"
)

type LevelHandler struct {
	Store store.LevelStore
}

func (h *LevelHandler) GetAll(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(h.Store.GetAll())
}

func (h *LevelHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid level id", http.StatusBadRequest)
		return
	}
	level, err := h.Store.GetByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(level)
}
