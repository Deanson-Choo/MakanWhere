import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export default function TopLogo() {
    return (
        <Image 
            source={require('@/assets/images/Logo_Plain.png')}
            style={styles.image}
            contentFit="contain"
        />
    )
}

const styles = StyleSheet.create({
    image: {
        width: 63,
        height: 78,
        alignSelf: 'center',
        marginTop: 40
    }
})