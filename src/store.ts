import { create } from 'zustand';

export const InteractionMode = {
    SELECT: 'SELECT',
    BUILD: 'BUILD'
} as const;

export type InteractionMode = typeof InteractionMode[keyof typeof InteractionMode];

interface GameState {
    mode: InteractionMode;
    selectedBuildingId: number | null;
    hoveredTile: { x: number, y: number } | null;

    setMode: (mode: InteractionMode) => void;
    setSelectedBuildingId: (id: number | null) => void;
    setHoveredTile: (tile: { x: number, y: number } | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
    mode: InteractionMode.SELECT,
    selectedBuildingId: null,
    hoveredTile: null,

    setMode: (mode) => set({ mode }),
    setSelectedBuildingId: (id) => set({ selectedBuildingId: id }),
    setHoveredTile: (tile) => set({ hoveredTile: tile }),
}));
