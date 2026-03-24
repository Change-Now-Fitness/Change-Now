import { Tabs } from 'expo-router';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={commonTabOptions}>
      <Tabs.Screen name="maindashboard/index" options={{ title: 'Dashboard' }}/>
      <Tabs.Screen name='customerexercise/index' options={{title: 'Exercise'}}/>
      <Tabs.Screen name='selectedexercise/index' options={{title: 'History'}}/>
      <Tabs.Screen name="userscreen/index" options={{ title: 'User' }}/>
    </Tabs>
  );
}

export const commonTabOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: '#6200ee',
  tabBarInactiveTintColor: '#ffffff',
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: 5,
  },
  tabBarStyle: {
    backgroundColor: '#333333',
    borderColor: '#969696',
    borderWidth:2,
    height: Platform.OS === 'ios' ? 60 : 30,
    position: 'absolute',
    paddingTop: 10,
    width:'80%',
    bottom: 30,
    borderRadius: 100,
    marginHorizontal:40,
  },
};