import React from "react";
import { Sparkles } from "lucide-react";
import { EmptyState } from "../ui/EmptyState";

/**
 * Renders an empty state view for recommendations.
 * Reuses the existing EmptyState component and its dashed border styles.
 */
export const RecommendationEmpty = ({
  title = "No recommendations available",
  description = "Check back later for personalized video suggestions based on your interests.",
}) => {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={Sparkles}
    />
  );
};

export default RecommendationEmpty;
