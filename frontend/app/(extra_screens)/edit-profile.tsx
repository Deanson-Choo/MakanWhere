import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from '@/services/profile';
import { router } from 'expo-router';
import useAuthStore from '@/store/authStore';

export default function EditProfileScreen() {
	const user = useAuthStore((state) => state.user);
	const updateProfileInStore = useAuthStore((state) => state.updateProfile);

	const [username, setUsername] = useState(user?.username ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		const updates: { username?: string; email?: string } = {};
		if (username !== user?.username) updates.username = username;
		if (email !== user?.email) updates.email = email;

		if (Object.keys(updates).length === 0) {
			Alert.alert('No Changes', 'You have not made any changes.');
			return;
		}

		setIsSaving(true);

		try {
			const res = await updateProfile(updates);
			updateProfileInStore(res.data);
			Alert.alert('Profile Updated', 'Your profile has been successfully updated.');
			router.back();
        } catch (error: any) {
            Alert.alert('Profile Update Failed', error.message || 'An error occurred while updating your profile. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
					<Ionicons name="arrow-back" size={22} color="#222" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Edit Profile</Text>
				<View style={styles.iconBtn} />
			</View>

			<View style={styles.content}>
				<View style={styles.formCard}>
					<Text style={styles.label}>Username</Text>
					<TextInput
						value={username}
						onChangeText={setUsername}
						placeholder="Your username"
						style={styles.input}
						placeholderTextColor="#999"
					/>

					<Text style={styles.label}>Email</Text>
					<TextInput
						value={email}
						onChangeText={setEmail}
						placeholder="you@example.com"
						keyboardType="email-address"
						autoCapitalize="none"
						style={styles.input}
						placeholderTextColor="#999"
					/>
				</View>

				<TouchableOpacity
					style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
					onPress={handleSave}
					disabled={isSaving}
				>
					<Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
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
	header: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: '#efefef',
	},
	iconBtn: {
		width: 34,
		height: 34,
		alignItems: 'center',
		justifyContent: 'center',
	},
	headerTitle: {
		fontSize: 17,
		fontWeight: '700',
		color: '#1a1a1a',
	},
	content: {
		flex: 1,
		paddingHorizontal: 18,
		paddingTop: 22,
	},
	formCard: {
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#ececec',
		padding: 14,
		backgroundColor: '#fafafa',
		gap: 8,
	},

	label: {
		marginTop: 6,
		fontSize: 13,
		fontWeight: '600',
		color: '#444',
	},
	input: {
		borderWidth: 1,
		borderColor: '#dfdfdf',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 15,
		color: '#222',
		backgroundColor: 'white',
	},
	saveBtn: {
		marginTop: 22,
		backgroundColor: '#007AFF',
		borderRadius: 12,
		paddingVertical: 13,
		alignItems: 'center',
	},
	saveBtnDisabled: {
		opacity: 0.7,
	},
	saveBtnText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '700',
	},
});
