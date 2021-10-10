import { useEffect } from "react";

export const useNavigationFocusListener = (navigation, onFocus) => {
  useEffect(() => {
    const unsub = navigation.addListener('focus', onFocus);
    return () => unsub();
  }, [navigation]);
};
