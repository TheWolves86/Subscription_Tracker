import { Redirect } from 'expo-router';
export default function Layout() {//This was used and it redirects to the index.tsx which is in app folder
  return <Redirect href="/(tabs)" />;
}