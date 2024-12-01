export const confidantPointCalculator = (confidantId: number, pointsGained: number, modelId: number) => {
  return `[f 5 13 ${confidantId} ${pointsGained} ${modelId}]`;
}