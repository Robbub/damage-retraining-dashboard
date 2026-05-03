export type TrainingStage = 
    | "initializing"
    | "loading_data"
    | "training"
    | "evaluating"
    | "deploying"
    | "completed"