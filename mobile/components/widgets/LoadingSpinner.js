import React, { Fragment, useContext, useRef, useState } from 'react';
import { Text, ActivityIndicator, Portal, Modal } from 'react-native-paper';
import { View } from 'react-native';

const SpinnerServiceContext = React.createContext();

export const useSpinner = () => useContext(SpinnerServiceContext);

export const SpinnerServiceProvider = ({ children }) => {
  const [spinnerState, setSpinnerState] = useState(null);
  const awaitingRef = useRef();

  const showSpinner = ({ message }) => {
    setSpinnerState({ message });
    new Promise((resolve) => {
      awaitingRef.current = { resolve };
    })
      .then(() => setSpinnerState(null));
    return [awaitingRef.current.resolve];
  };

  return (
    <>
      <SpinnerServiceContext.Provider value={showSpinner} children={children} />
      <SpinnerDialog visible={Boolean(spinnerState)} message={spinnerState?.message} />
    </>
  );
};

export const SpinnerDialog = ({ visible, message }) => (
  <Portal>
    <Modal dismissable={false} visible={visible} contentContainerStyle={{ borderRadius: 15, backgroundColor: 'white', margin: 40, height: 180, padding: 20 }}>
      <LoadingSpinner message={message} size="large" />
    </Modal>
  </Portal>
);

export const LoadingSpinner = ({ style, message = 'Fetching data', delay = 0, size }) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, []);

  const display = (
    <View
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size={size} />
      <Text style={{ ...style, textAlign: 'center', padding: 12 }}>{message}</Text>
    </View>
  );

  return (
    <>
      {visible && display}
    </>
  );
};
