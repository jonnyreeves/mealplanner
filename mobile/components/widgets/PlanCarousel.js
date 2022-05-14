import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Dimensions, FlatList, View, Text,
} from 'react-native';
import { sortedPlans } from '../helpers/planData';
import { PlannerGrid } from './PlannerGrid';
import { PlanSelector } from './PlanSelector';
import { TodayView } from './TodayView';

// eslint-disable-next-line arrow-body-style
export const PlanCarousel = ({
  planData, swapSource, onMealSelected, refreshControl, readonly, showTodayView,
}) => {
  const carouselRef = useRef(null);

  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(showTodayView ? 1 : 0);
  const [firstRender, setFirstRender] = useState(true);

  const plans = sortedPlans(planData);
  const listData = (showTodayView)
    ? [{ todayView: true, planId: 'kek' }, ...plans]
    : plans;

  useEffect(() => {
    if (plans.length > 0 && !plans.some((p) => p.planId === selectedPlanId)) {
      setSelectedPlanId(plans[0].planId);
    }
  }, [planData]);

  // Syncronise the Planner Grid Carousel with the Plan Selector
  useEffect(() => {
    if (plans.length > 0) {
      const idx = listData.findIndex((plan) => plan.planId === selectedPlanId);
      if (idx !== -1 && carouselIndex !== idx) {
        setCarouselIndex(idx);
      }
    }
  }, [selectedPlanId]);

  // Syncronise the Plan Selector with the Planner Grid Carousel.
  useEffect(() => {
    if (listData.length > 0 && carouselIndex >= 0 && carouselIndex < listData.length) {
      if (selectedPlanId !== listData[carouselIndex].planId) {
        setSelectedPlanId(listData[carouselIndex].planId);
      }
    }
  }, [carouselIndex]);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollToIndex({ index: carouselIndex, animated: !firstRender });
      setFirstRender(false);
    }
  }, [carouselIndex]);

  const { width } = Dimensions.get('window');

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
        data={listData}
        itemWidth={width}
        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
        scrollEventThrottle={100}
        refreshControl={refreshControl}
        ref={carouselRef}
        extraData={firstRender}
        keyExtractor={(item) => item.planId}
        onMomentumScrollEnd={(e) => {
          const { contentOffset } = e.nativeEvent;
          const viewSize = e.nativeEvent.layoutMeasurement;
          const pageNum = Math.round(contentOffset.x / viewSize.width);
          setCarouselIndex(pageNum);
        }}
        renderItem={({ item }) => {
          if (item.todayView) {
            return (
              <View style={{ width }}>
                <TodayView planData={planData} />
              </View>
            );
          }
          return (
            <PlannerGrid
              swapSource={swapSource}
              onMealSelected={onMealSelected}
              plan={item}
            />
          );
        }}
      />
    </>
  );
};
