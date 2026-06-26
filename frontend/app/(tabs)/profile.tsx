import { Text, StyleSheet, TouchableOpacity, View, Alert } from "react-native";  
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "@/store/authStore";
import { router } from "expo-router";
import { logout } from "@/services/auth";
import { deleteProfile } from "@/services/profile";
import { Image } from "expo-image";

export default function Profile() {
    const user = useAuthStore((state) => state.user);
    const logoutFromStore = useAuthStore((state) => state.logout);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const avatarSeed = user?.id ? String(user.id) : "guest";
    const avatarUrl = `https://api.dicebear.com/10.x/toon-head/svg?seed=${avatarSeed}`;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout(); // Remove token from server
            logoutFromStore(); // Clear user and tokens from store
        } catch (error: any) {
            Alert.alert('Logout Failed', error.message || 'An error occurred while logging out. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleDeleteProfile = async() => {
        Alert.alert(
            'Delete Profile',
            'Are you sure you want to delete your profile? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await deleteProfile();
                        logoutFromStore(); // Clear user and tokens from store
                    } catch (error: any) {
                        Alert.alert('Delete Profile Failed', error.message || 'An error occurred while deleting your profile. Please try again.');
                    }
                } }
            ]
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.imageContainer}>
                <Image source={require('../../assets/images/Logo_Initials.png')} style={styles.logoImage} contentFit="contain" />
            </View>
            {/* Avatar + Name */}
            <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                    <Image source={{ uri: avatarUrl }} style={styles.userAvatar} contentFit="cover" /> 
                </View>
                <Text style={styles.username}>{user?.username}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            {/* Delete Profile Button */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
                <Ionicons name="trash-outline" size={20} color="#e53935" />
            </TouchableOpacity>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/edit-profile')}>
                    <Ionicons name="person-outline" size={20} color="#333" />
                    <Text style={styles.menuLabel}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" style={styles.menuChevron} />
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout} disabled={isLoggingOut}>
                    <Ionicons name="log-out-outline" size={20} color="#e53935" />
                    <Text style={[styles.menuLabel, { color: '#e53935' }]}>{isLoggingOut ? 'Logging Out...' : 'Log Out'}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        overflow: 'hidden',
    },
    username: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    email: {
        fontSize: 14,
        color: '#888',
        marginTop: 4,
    },
    menuSection: {
        marginTop: 24,
        marginHorizontal: 16,
        backgroundColor: '#fafafa',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ececec',
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 12,
    },
    menuLabel: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    menuChevron: {
        marginLeft: 'auto',
    },
    separator: {
        height: 1,
        backgroundColor: '#ececec',
        marginHorizontal: 16,
    },
    deleteButton: {
        position: 'absolute',
        top: 55,
        right: 25
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        height: 100,
    },
    logoImage: {
        width: 70,
        height: 70,
    },
    userAvatar: {
        width: '100%',
        height: '100%',
    },
});
    