import { useNavigation } from "react-router";
import { LoadingSpinner } from "./LoadingSpinner";

export function NavigationLoader() {
  const navigation = useNavigation();
  
  // Show loading spinner during navigation
  if (navigation.state === "loading") {
    return <LoadingSpinner />;
  }
  
  return null;
}
