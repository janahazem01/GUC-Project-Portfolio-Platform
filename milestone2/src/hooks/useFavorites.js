import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";

const favoritesRoles = ["student", "employer"];

function normalizeIds(ids) {
  return Array.isArray(ids) ? ids.map(Number).filter(Number.isFinite) : [];
}

function toggleId(ids, id, shouldSave) {
  const normalizedId = Number(id);
  const currentIds = normalizeIds(ids);

  if (!Number.isFinite(normalizedId)) return currentIds;

  if (shouldSave) {
    return currentIds.includes(normalizedId)
      ? currentIds
      : [...currentIds, normalizedId];
  }

  return currentIds.filter((item) => item !== normalizedId);
}

export function useFavorites() {
  const { user, updateUser } = useContext(AuthContext);
  const canUseFavorites = favoritesRoles.includes(user?.role);

  const favoriteProjectIds = useMemo(
    () => normalizeIds(user?.favoriteProjectIds),
    [user?.favoriteProjectIds]
  );

  const favoritePortfolioIds = useMemo(
    () => normalizeIds(user?.favoritePortfolioIds),
    [user?.favoritePortfolioIds]
  );

  const updateFavorites = (key, id, shouldSave) => {
    if (!canUseFavorites) return;
    updateUser({ [key]: toggleId(user?.[key], id, shouldSave) });
  };

  return {
    canUseFavorites,
    favoriteProjectIds,
    favoritePortfolioIds,
    isFavoriteProject: (projectId) => favoriteProjectIds.includes(Number(projectId)),
    isFavoritePortfolio: (portfolioId) => favoritePortfolioIds.includes(Number(portfolioId)),
    saveProject: (projectId) => updateFavorites("favoriteProjectIds", projectId, true),
    removeProject: (projectId) => updateFavorites("favoriteProjectIds", projectId, false),
    savePortfolio: (portfolioId) => updateFavorites("favoritePortfolioIds", portfolioId, true),
    removePortfolio: (portfolioId) => updateFavorites("favoritePortfolioIds", portfolioId, false),
  };
}
