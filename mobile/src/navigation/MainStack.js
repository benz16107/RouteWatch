import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import DashboardScreen from '../screens/DashboardScreen';

function HeaderButton({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ marginRight: 16 }}>
      <Text style={{ color: '#fff', fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
  );
}
import JobsListScreen from '../screens/JobsListScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import NewJobScreen from '../screens/NewJobScreen';
import EditJobScreen from '../screens/EditJobScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SnapshotDetailScreen from '../screens/SnapshotDetailScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2563eb' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({ title: 'RouteWatch', headerRight: () => <HeaderButton title="Profile" onPress={() => navigation.navigate('Profile')} /> })}
      />
      <Stack.Screen name="JobsList" component={JobsListScreen} options={{ title: 'Routes' }} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Route' }} />
      <Stack.Screen name="NewJob" component={NewJobScreen} options={{ title: 'New route' }} />
      <Stack.Screen name="EditJob" component={EditJobScreen} options={{ title: 'Edit route' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="SnapshotDetail" component={SnapshotDetailScreen} options={{ title: 'Snapshot' }} />
    </Stack.Navigator>
  );
}
