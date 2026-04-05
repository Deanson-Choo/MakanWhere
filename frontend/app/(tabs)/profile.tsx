import { Text, StyleSheet, TouchableOpacity, View, TextInput } from "react-native";  
import { SafeAreaView } from "react-native-safe-area-context";
import { logout } from "@/services/auth";
import useAuthStore from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { fetchReviewsByUser } from "@/services/reviews";
import { Image } from 'expo-image'
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile } from "@/services/auth";

export default function Profile() {
    const { user } = useAuthStore();
    const [email, setEmail] = useState(user?.email ?? '');
    const [username, setUsername] = useState(user?.username ?? '');
    const [password, setPassword] = useState<string>('');
    const [editing, setEditing] = useState(false);
    
    const { data } = useQuery({
        queryKey: ['reviews', 'createdAt', true],
        queryFn: () => fetchReviewsByUser('createdAt', 'desc'),
    }) 

    useEffect(() => {
        setEmail(user?.email ?? '');
        setUsername(user?.username ?? '');
    }, [user?.email, user?.username]);

    const handleProfileUpdate = async () => {
        try {
            const nextUsername = username.trim();
            const nextEmail = email.trim();
            const nextPassword = password.trim();

            const currentUsername = user?.username ?? '';
            const currentEmail = user?.email ?? '';

            const usernameChanged = nextUsername !== currentUsername;
            const emailChanged = nextEmail !== currentEmail;
            const passwordChanged = nextPassword.length > 0;

            await updateProfile(
                emailChanged ? nextEmail : undefined,
                usernameChanged ? nextUsername : undefined,
                passwordChanged ? nextPassword : undefined
            );

            setPassword('');
            setEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
        }
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{ alignItems: "center", marginTop: 32 }}>
                <View style={{ flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <View style={{borderRadius: 50, overflow: "hidden", borderColor: "#d6e1f3", borderWidth: 2}}>
                        <Image 
                        source={{ uri: `https://api.dicebear.com/9.x/personas/svg?seed=${user?.id}` }}
                        style={{ width: 100, height: 100 }} 
                        contentFit ="cover"
                        />
                    </View>
                    <Text style={styles.reviewCount}>Reviews: {data?.length ?? 0}</Text>                
                </View>

                {editing ? (
                    <View>
                        <View>
                            <Text>Username</Text>
                            <TextInput
                                style={styles.textInput}
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Enter username"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                            />
                        </View>
                        <View>
                            <Text>Email</Text>
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter email"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        <View>
                            <Text>Password</Text>
                            <TextInput
                                style={styles.textInput}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                placeholder="Enter new password"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                ) : (
                    <Text style={styles.welcomeText}>{user?.username}</Text>
                )}
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
            {editing ? (
                <>
                    <Ionicons name="checkmark" size={24} color="green" style={{ position: "absolute", top: 50, right: 20 }} onPress={() => handleProfileUpdate()} />
                    <Ionicons name="close" size={24} color="red" style={{ position: "absolute", top: 90, right: 20 }} onPress={() => setEditing(false)} />
                </>
            ) : (
                <Ionicons name="pencil" size={24} color="black" style={{ position: "absolute", top: 50, right: 20 }} onPress={() => setEditing(!editing)} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        position: "relative"
    },
    logoutButton: {
        backgroundColor: "#EF4444",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        margin: 14,
        width: "90%",
    },
    logoutButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "700",
        color: "#111827",
        margin: 14,
    },
    reviewCount: {
        fontSize: 16,
        color: "#6B7280",
        marginHorizontal: 14,
    },
    textInput: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 12,
        marginVertical: 6,
        width: 250,
        color: "black"
    },
});