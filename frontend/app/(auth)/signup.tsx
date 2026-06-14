import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import { register } from '@/services/auth';
import TopLogo from '@/components/TopLogo';
import { Ionicons } from "@expo/vector-icons";
import { Colors } from '@/constants/colors';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleSignUp = async () => {
        if (email && username && password) {
            setIsLoading(true);
            try {
                await register(email, username, password);
            } finally {
                setIsLoading(false);
            }
        } else {
            Alert.alert("Error", "Please fill in all fields.");
        }
    }

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <TopLogo />
            <View style={styles.container}>
                <Ionicons name="arrow-back" size={24} color="black" style={styles.backArrow} onPress={() => router.back()} />
                <Text style={styles.title}>Sign up</Text>
                <Text style={styles.subtitle}>Create an account to continue!</Text>
                <View style={styles.formContainer}>
                    <View>
                        <Text style={styles.formHeader}>Username</Text>
                        <TextInput 
                            style={styles.formInput}
                            value={username}
                            placeholder="recco247"
                            onChangeText={setUsername}
                        />
                    </View>
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
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? "Signing up..." : "Sign Up"}</Text>
                </TouchableOpacity>
            </View>
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
        top: -29,
        left: 40
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
    button: {
        marginTop: 16,
        marginBottom: 24,
        backgroundColor: Colors.primary,
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
    }
})