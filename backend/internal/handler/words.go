package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"sprunki-backend/internal/store"
)

type WordHandler struct {
	Store store.WordStore
}

func (h *WordHandler) GetByTier(w http.ResponseWriter, r *http.Request) {
	tierStr := r.URL.Query().Get("tier")
	if tierStr == "" {
		http.Error(w, "tier parameter required", http.StatusBadRequest)
		return
	}
	tier, err := strconv.Atoi(tierStr)
	if err != nil {
		http.Error(w, "invalid tier", http.StatusBadRequest)
		return
	}
	words := h.Store.GetByTier(tier)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(words)
}
