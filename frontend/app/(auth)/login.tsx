import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { Link } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "@/services/auth";
import { useState } from "react";
import TopLogo from "@/components/TopLogo";
import { Ionicons } from "@expo/vector-icons";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (email && password) {
            setIsLoading(true);
            try {
                await login(email, password);
            } finally {
                setIsLoading(false);
            }
        } else {
            Alert.alert("Error", "Please enter both email and password.");
        }
    }
    
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <TopLogo />
            <View style={styles.container}>
                <Text style={styles.title}>Sign in to your Account</Text>
                <Text style={styles.subtitle}>Enter your email and password to log in</Text>
                <View style={styles.formContainer}>
                    <View>
                        <Text style={styles.formHeader}>Email</Text>
                        <TextInput 
                            style={styles.formInput}
                            value={email}
                            placeholder="recco247@email.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onChangeText={setEmail}
                        />
                    </View>
                    <View>
                        <Text style={styles.formHeader}>Password</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput 
                                style={styles.passwordInput}
                                value={password}
                                placeholder="********"
                                secureTextEntry={!showPassword}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.forgetPassword}>Forgot password?</Text>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? "Logging in..." : "Log In"}</Text>
                </TouchableOpacity>
                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <Link style={styles.signUp} href="/(auth)/signup">Sign Up</Link>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    image: {
        width: 63,
        height: 78,
        alignSelf: 'center',
        marginTop: 20,
        marginBottom: 39
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
    forgetPassword: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007bff',
        alignSelf: 'flex-end',
    },
    button: {
        marginTop: 16,
        marginBottom: 24,
        backgroundColor: '#F3882C',
        paddingVertical: 10,
        paddingHorizontal: 24,
        width: 327,
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 8
    },
    signUp: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007bff',
    },
    footerContainer: {
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
    },
})