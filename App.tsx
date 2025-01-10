import {
  Alert,
  AppState,
  Button,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import mobileAds, {MaxAdContentRating} from 'react-native-google-mobile-ads';
import {AppOpenAd, TestIds, AdEventType} from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.APP_OPEN
  : 'ca-app-pub-5556843535923514~6682733543';

const App = () => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [onToggle, setOnToggle] = useState(false);
  const [isAddShow, setIsAddShow] = useState(false); // Default to false
  const [appOpenAdInstance, setAppOpenAdInstance] = useState<AppOpenAd | null>(
    null,
  );
  const [adWasShown, setAdWasShown] = useState(false); // Track if ad was shown before

  const appLoad = () => {
    // Create new ad instance each time
    const adInstance = AppOpenAd.createForAdRequest(adUnitId, {
      keywords: ['fashion', 'clothing'],
    });

    console.log('Created App Open Ad Instance:', adInstance);

    setAppOpenAdInstance(adInstance);

    adInstance.addAdEventListener(AdEventType.LOADED, () => {
      console.log('App Open Ad Loaded');
      setAdLoaded(true);
    });

    adInstance.addAdEventListener(AdEventType.ERROR, error => {
      console.log('App Open Ad failed to load', error);
    });

    adInstance.addAdEventListener(AdEventType.CLOSED, () => {
      setIsAddShow(true);
      console.log('App Open Ad Closed');
    });

    adInstance.load();
  };

  useEffect(() => {
    console.log('Initializing Google Mobile Ads SDK...');
    mobileAds()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        testDeviceIdentifiers: ['EMULATOR'],
      })
      .then(() => {
        console.log('Ad request configuration set!');
      })
      .catch(error => {
        console.log('Error setting ad configuration:', error);
      });

    mobileAds()
      .initialize()
      .then(() => {
        console.log('Google Mobile Ads SDK initialized!');
      })
      .catch(error => {
        console.log('Error initializing Google Mobile Ads SDK:', error);
      });

    // Initial ad load
    appLoad();

    const appStateListener = AppState.addEventListener(
      'change',
      nextAppState => {
        console.log('App State Change:', nextAppState);

        if (nextAppState === 'active') {
          // Show ad only when app is active and ad isn't already shown
          if (adLoaded && !isAddShow) {
            // setIsAddShow(true);
            console.log(
              '------NextState is ----',
              nextAppState,
              '----isAddShow----',
              isAddShow,
            );

            showAppOpenAd();
          }
        } else if (nextAppState === 'background' && isAddShow) {
          console.log(
            '------NextState is ----',
            nextAppState,
            '----isAddShow----',
            isAddShow,
          );
          setIsAddShow(false);
        }
      },
    );

    return () => {
      appStateListener.remove();
      if (appOpenAdInstance) {
        appOpenAdInstance.removeAllListeners();
      }
    };
  }, [adLoaded, isAddShow, adWasShown]);

  const showAppOpenAd = () => {
    console.log('Trying to show App Open Ad');
    if (adLoaded && appOpenAdInstance) {
      appOpenAdInstance
        .show()
        .then(() => {
          setAdWasShown(true);
          console.log('App Open Ad shown');
        })
        .catch(error => {
          console.log('Error showing ad:', error);
        });
    } else {
      console.log('App Open Ad is not ready yet');
    }
  };

  return (
    <View style={{flex: 1}}>
      <Text>App</Text>
      {/* <Button
        title="Show App Open Ad"
        onPress={() => {
          if (adLoaded) {
            try {
              showAppOpenAd();
            } catch (error) {
              console.log('Error showing ad:', error);
            }
          } else {
            Alert.alert('Ad not loaded');
          }
        }}
      /> */}
      <Button
        title="Click ME"
        onPress={() => {
          setOnToggle(true);
          const url = 'https://www.example.com';

          // Open URL in the default browser (this will open in Chrome if it's the default browser)
          Linking.openURL(url).catch(err =>
            console.error('An error occurred', err),
          );
        }}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({});
