import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import { register } from '@/services/auth';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = () => {
        if (email && username && password) {
            register(email, username, password);
        } else {
            Alert.alert("Error", "Please fill in all fields.");
        }
    }

    return (
        <SafeAreaView style={styles.safeAreaView}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.appName}>MakanWhere</Text>
                    <Text style={styles.subtitle}>Create your account</Text>
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
                        <Text style={styles.label}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="jeff152"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                            value={username}
                            onChangeText={setUsername}
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

                    <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Link style={styles.link} href="/login">Log in</Link>
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