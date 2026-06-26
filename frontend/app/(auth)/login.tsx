import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "@/services/auth";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "@/store/authStore";
import Logo from "@/components/Logo";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const storeLogin = useAuthStore((state) => state.login);

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleLogin = async () => {
        // 1. Validate
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        let hasError = false;
        if (!trimmedEmail) {
            setEmailError('Email is required'); hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setEmailError('Invalid email format'); hasError = true;
        } else {
            setEmailError('');
        }

        if (!trimmedPassword) {
            setPasswordError('Password is required'); hasError = true;
        } else {
            setPasswordError('');
        }

        if (hasError) return;

        // 2. Call API and store state
        try {
            setIsLoading(true);
            const { data, accessToken, refreshToken } = await login(trimmedEmail, trimmedPassword);
            storeLogin(data, accessToken, refreshToken);
        } catch (error: any) {
            Alert.alert('Login Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.imageContainer}>
                        <Logo/>
                    </View>
                    <Text style={styles.title}>Sign in to your Account</Text>
                    <Text style={styles.subtitle}>Enter your email and password to log in</Text>
                    <View style={styles.formContainer}>
                        <View>
                            <Text style={styles.formHeader}>Email</Text>
                            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                            <TextInput 
                                style={styles.formInput}
                                value={email}
                                placeholder="recco247@email.com"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onChangeText={setEmail}
                            />
                        </View>
                        <View>
                            <Text style={styles.formHeader}>Password</Text>
                            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                            <View style={styles.passwordInputContainer}>
                                <TextInput 
                                    style={styles.passwordInput}
                                    value={password}
                                    placeholder="********"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                        <Text style={styles.buttonText}>{isLoading ? "Logging in..." : "Log In"}</Text>
                    </TouchableOpacity>
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Don&apos;t have an account?</Text>
                        <Link style={styles.signUp} href="/signup">Sign Up</Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
        height: 100,
    },
    container: {
        marginTop: 55,
        flex: 1,
        width: '100%',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 12
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
        marginBottom: 32
    },
    formHeader: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2
    },
    formInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    passwordInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        paddingVertical: 10,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    formContainer: {
        flexDirection: 'column',
        gap: 16
    },
    errorText: {
        fontSize: 11,
        fontWeight: '400',
        color: '#FF3B30',
        marginTop: 2,
    },
    button: {
        marginTop: 16,
        marginBottom: 24,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 24,
        width: '100%',
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
    },
    signUp: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007AFF',
    },
    footerContainer: {
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
    },
})