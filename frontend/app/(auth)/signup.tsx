import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import { register } from '@/services/auth';
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from '@/store/authStore';
import Logo from '@/components/Logo';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const storeRegister = useAuthStore((state) => state.register);

    const [emailError, setEmailError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSignUp = async () => {
        // 1. Validate
        const trimmedEmail = email.trim();
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        let hasError = false;
        if (!trimmedEmail) {
            setEmailError('Email is required'); hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { // Simple email regex for basic validation
            setEmailError('Invalid email format'); hasError = true;
        } else {
            setEmailError('');
        }

        if (!trimmedUsername) {
            setUsernameError('Username is required'); hasError = true;
        } else {
            setUsernameError('');
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
            const { data, accessToken, refreshToken } = await register(trimmedUsername, trimmedEmail, trimmedPassword);
            storeRegister(data, accessToken, refreshToken);
        } catch (error: any) {
            Alert.alert('Sign Up Failed', error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.container}>
                        <Ionicons name="arrow-back" size={24} color="black" style={styles.backArrow} onPress={() => router.back()} />
                        <View style={styles.imageContainer}>
                            <Logo/>
                        </View>
                        <Text style={styles.title}>Sign up</Text>
                        <Text style={styles.subtitle}>Create an account to continue!</Text>
                        <View style={styles.formContainer}>
                            <View>
                                <Text style={styles.formHeader}>Username</Text>
                                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
                                <TextInput 
                                    style={styles.formInput}
                                    value={username}
                                    placeholder="recco247"
                                    placeholderTextColor="#9CA3AF"
                                    onChangeText={setUsername}
                                />
                            </View>
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
                        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
                            <Text style={styles.buttonText}>{isLoading ? "Signing up..." : "Sign Up"}</Text>
                        </TouchableOpacity>
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
    backArrow: {
        position: 'absolute',
        top: -32,
        left: 25
    },
    scrollContent: {
        flexGrow: 1,
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
        marginBottom: 2,
    },
    formInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 14,
        fontWeight: '400',
    },
    passwordInput: {
        fontSize: 14,
        fontWeight: '400',
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
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        color: '#FFFFFF',
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
        height: 100,
    },
})