import { Text, TextInput, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Link } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { login } from "@/services/auth";
import { useState } from "react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (email && password) {
            login(email, password);
        } else {
            Alert.alert("Error", "Please enter both email and password.");
        }
    }
    
    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.appName}>MakanWhere</Text>
                    <Text style={styles.subtitle}>Find your next favourite meal</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="example@gmail.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#9CA3AF"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleLogin}>
                        <Text style={styles.buttonText}>Log in</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don&apos;t have an account? </Text>
                    <Link style={styles.link} href="/signup">Sign up</Link>
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
    container: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
    },
    form: {
        gap: 16,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    button: {
        height: 48,
        backgroundColor: '#3B82F6',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
        color: '#6B7280',
    },
    link: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
})