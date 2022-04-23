import React, { useEffect, useRef } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import { sortedPlans, usePlanSelector } from '../helpers/planData';
import { PlannerGrid } from './PlannerGrid';
import { PlanSelector } from './PlanSelector';

// eslint-disable-next-line arrow-body-style
export const PlanCarousel = ({
  planData, swapSource, onMealSelected, refreshing, doRefresh, readonly
}) => {
  const carouselRef = useRef(null);
  const {
    selectedPlanId,
    setSelectedPlanId,
    carouselIndex,
    setCarouselIndex,
  } = usePlanSelector();

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollToIndex({ index: carouselIndex });
    }
  }, [carouselIndex]);

  const { width } = Dimensions.get('window');
  const plans = sortedPlans(planData);

  return (
    <>
      <View style={{ margin: 20 }}>
        <PlanSelector
          planData={planData}
          readonly={readonly}
          selectedPlanId={selectedPlanId}
          setSelectedPlanId={setSelectedPlanId}
        />
      </View>
      <FlatList
        horizontal
        pagingEnabled
        data={plans}
        itemWidth={width}
        scrollEventThrottle={100}
        ref={carouselRef}
        keyExtractor={(item) => item.planId}
        onMomentumScrollEnd={(e) => {
          const { contentOffset } = e.nativeEvent;
          const viewSize = e.nativeEvent.layoutMeasurement;
          const pageNum = Math.round(contentOffset.x / viewSize.width);
          setCarouselIndex(pageNum);
        }}
        renderItem={({ item }) => (
          <PlannerGrid
            swapSource={swapSource}
            onMealSelected={onMealSelected}
            plan={item}
            refreshing={refreshing}
            onRefresh={doRefresh}
          />
        )}
      />
    </>
  );
};
