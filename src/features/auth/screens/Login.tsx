import React from 'react';
import { Box, Center, VStack, Heading, Text, Input, Icon, Pressable, Image, StatusBar, Spinner } from 'native-base';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../../app/providers/AuthProvider';
import { useLogin } from '../../../libs/api/auth';
import { Dimensions } from 'react-native';

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Main: undefined;
};

export default function LoginScreen() {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const loginMutation = useLogin();

  const [email, setEmail] = React.useState('admin@gmail.com');
  const [password, setPassword] = React.useState('123456');
  const [show, setShow] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  const screenHeight = Dimensions.get('window').height;

  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('App');
    }
  }, [isAuthenticated, navigation]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    try {
      await loginMutation.mutateAsync({ email: email.trim(), password });
    } catch (error: any) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box flex={1} bg="white">
      <StatusBar barStyle={"dark-content"} />
      <Center flex={1} px="6">
      <Image
          source={{ uri: "https://cdn.dribbble.com/userupload/6478950/file/original-0c9bd37677dd79d495694d83d79da7f8.png?resize=400x300" }}
          alt="Logo"
          size="xl"
          mb="4"
        />
        <VStack w="100%" maxW="360" space="6" alignItems="center">
          <VStack space="1" alignItems="center">
            <Heading size="xl" fontWeight="bold">Welcome!</Heading>
            <Text fontSize="md">to <Text color="brand.500" fontWeight="bold">TaskManager</Text></Text>
          </VStack>

          <Box w="100%" p="5" borderRadius="2xl">
            {loginMutation.error && (
              <Box bg="red.100" p="3" borderRadius="md" mb="4">
                <Text color="red.600" fontSize="sm">
                  {loginMutation.error.message || 'Login failed. Please try again.'}
                </Text>
              </Box>
            )}
            <Input
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              px="4" py="4" mb="2"
              borderWidth={1}
              borderColor={errors.email ? "red.400" : "#CFC7FF"}
              borderRadius="xl"
              InputLeftElement={<Icon as={Mail} ml="3" size="sm" color="muted.400" />}
              isDisabled={loginMutation.isPending}
            />
            {errors.email && (
              <Text color="red.500" fontSize="xs" mb="2">{errors.email}</Text>
            )}

            <Input
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }}
              placeholder="Password"
              secureTextEntry={!show}
              autoCapitalize="none"
              px="4" py="4" mb="2"
              borderWidth={1}
              borderColor={errors.password ? "red.400" : "#CFC7FF"}
              borderRadius="xl"
              InputLeftElement={<Icon as={Lock} ml="3" size="sm" color="muted.400" />}
              InputRightElement={
                <Pressable onPress={() => setShow(s => !s)}>
                  <Icon as={show ? Eye : EyeOff} mr="3" size="sm" color="muted.400" />
                </Pressable>
              }
              isDisabled={loginMutation.isPending}
            />
            {errors.password && (
              <Text color="red.500" fontSize="xs" mb="4">{errors.password}</Text>
            )}
            <Pressable
              onPress={handleLogin}
              isDisabled={loginMutation.isPending}
              opacity={loginMutation.isPending ? 0.6 : 1}
            >
              <Box borderRadius="full" overflow="hidden">
                <LinearGradient
                  colors={['#7367F0', '#A86CF7']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 16, alignItems: 'center' }}
                >
                  {loginMutation.isPending ? (
                    <Spinner color="white" size="sm" />
                  ) : (
                    <Text color="white" fontWeight="bold" fontSize="md">Login</Text>
                  )}
                </LinearGradient>
              </Box>
            </Pressable>
          </Box>
        </VStack>
      </Center>
    </Box>
  );
}