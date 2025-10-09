import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Update the state with the current value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Create an event listener
    const listener = () => setMatches(media.matches);
    
    // Add the listener
    media.addListener(listener);
    
    // Clean up
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

export default useMediaQuery;
