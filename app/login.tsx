import { auth, db } from '@/services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
import { resetTipsShownForSession } from '@/components/DailyTipsDialog';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, FontSize, Shadow, FontWeight } from '@/constants/theme';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const passwordInput = useRef<TextInput>(null);

  const gotoSignup = () => {
    router.push("/signup");
  };

  const getCurrentUserRole = async (userId: string): Promise<string | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data().role : null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    return true;
  };

  const checkVetCredentials = async (userId: string): Promise<boolean> => {
    try {
      const vetDoc = await getDoc(doc(db, 'vets', userId));
      return vetDoc.exists();
    } catch (error) {
      console.error('Error checking vet credentials:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    console.log('🔑 Login attempt:', { email: email.trim() });

    try {
      console.log('🔐 Attempting Firebase authentication...');
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      console.log('✅ Authentication successful, UID:', user.uid);

      await AsyncStorage.setItem('userId', user.uid);
      // Ensure daily tips can show once right after login.
      await resetTipsShownForSession();
      
      const userRole = await getCurrentUserRole(user.uid);
      console.log('👥 User role:', userRole);
      
      if (!userRole) {
        console.error('❌ No role found for user');
        Alert.alert('Error', 'Your account is not properly configured');
        await resetTipsShownForSession();
        await auth.signOut();
        return;
      }

      if (userRole === 'veterinarian') {
        const hasCredentials = await checkVetCredentials(user.uid);
        const route = hasCredentials ? '/vets/home' : '/vets/credentials';
        console.log('🚀 Navigating to:', route);
        router.replace({ pathname: route, params: { userId: user.uid } });
      } else {
        console.log('🚀 Navigating to: /home');
        router.replace({ pathname: '/home', params: { userId: user.uid } });
      }
      
    } catch (error: any) {
      console.error('🔥 Login error:', {
        code: error?.code || 'unknown',
        message: error?.message || 'Unknown error'
      });
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Invalid email or password';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'Invalid login credentials. Please check your email and password.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'permission-denied':
            errorMessage = 'You do not have permission to access this resource.';
            break;
          default:
            errorMessage = `Authentication failed: ${error.message || 'Unknown error'}`;
        }
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Success', 'Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error?.code, error?.message);
      let errorMessage = 'Failed to send password reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../assets/images/paw.jpg')}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.title}>PetCare</Text>
              <Text style={styles.subtitle}>Welcome back! Please sign in to continue</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  keyboardAppearance="light"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordInput.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  ref={passwordInput}
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  autoComplete="password"
                  textContentType="password"
                  keyboardAppearance="light"
                  enablesReturnKeyAutomatically={true}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={handlePasswordReset}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={gotoSignup} disabled={isLoading}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSection: {
    paddingTop: Spacing.xxl + 20,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.white,
    padding: 4,
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    flex: 1,
    ...Shadow.xl,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.light.text,
  },
  eyeIcon: {
    padding: Spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    color: Colors.light.primary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  signupText: {
    color: Colors.light.textSecondary,
    fontSize: FontSize.md,
  },
  signupLink: {
    color: Colors.light.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
});

export default Login;
