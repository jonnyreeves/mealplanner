import { useNavigation } from '@react-navigation/core';
import { useEffect, useContext } from 'react';
import { AppStateCtx, SessionStateCtx } from '../../service/context';

export const useNavigationFocusListener = (onFocus) => {
  const navigation = useNavigation();
  useEffect(() => {
    const unsub = navigation.addListener('focus', onFocus);
    return () => unsub();
  }, [navigation]);
};

export const useNavigationBeforeRemove = (handler) => {
  const navigation = useNavigation();
  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e) => handler(e));
    return () => {
      console.log('removing navigation listener...');
      unsub();
    };
  }, [navigation]);
};

export const useAppState = () => useContext(AppStateCtx);
export const useSessionState = () => useContext(SessionStateCtx);

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

export const useListsUpdatedListener = (onUpdated) => {
  const appState = useAppState();
  useEffect(() => {
    const unsub = appState.addListener('lists_updated', () => onUpdated());
    return () => unsub();
  }, []);
};
