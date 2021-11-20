import { useNavigation } from '@react-navigation/core';
import { useEffect, useContext } from 'react';
import { AppStateCtx } from '../../service/context';

export const useNavigationFocusListener = (onFocus) => {
  const navigation = useNavigation();
  useEffect(() => {
    const unsub = navigation.addListener('focus', onFocus);
    return () => unsub();
  }, [navigation]);
};

export const useAppState = () => useContext(AppStateCtx);

export const useRecipesUpdatedListener = (onUpdated) => {
  const appState = useAppState();
  useEffect(() => {
    const unsub = appState.addListener('recipes_updated', () => onUpdated());
    return () => unsub();
  }, []);
};

export const usePlanUpdatedListener = (onUpdated) => {
  const appState = useAppState();
  useEffect(() => {
    const unsub = appState.addListener('plan_updated', () => onUpdated());
    return () => unsub();
  }, []);
};
